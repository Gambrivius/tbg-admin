// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import connectMongo from "../../lib/mongo";
import Room from "../../models/room";
import type IRoom from "../../models/room";

import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { z } from "zod";

type RoomResponse = {
  message?: string;
  error?: any;
  rooms?: typeof IRoom[];
};

const mongoIdSchema = z.string().length(24);

const roomSchema = z.object({
  name: z.string().min(1).max(40),
  description: z.string().optional(),
  zone: z.string().length(24),
  exits: z.array(
    z
      .object({
        direction: z.string().min(1).max(15),
        destination: z.string().length(24),
      })
      .optional()
  ),
});

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<RoomResponse>
) {
  await connectMongo();

  if (req.query.id) {
    try {
      const id = mongoIdSchema.parse(req.query.id);
      const r = await Room.findById(id);
      if (r) res.status(200).json({ rooms: [r] });
      else res.status(400).json({ message: "Not found" });
    } catch (e) {
      res.status(400).json({ message: "Error", error: e });
    }
  } else if (req.query.zone) {
    try {
      const zoneId = mongoIdSchema.parse(req.query.zone);

      const r = await Room.find({ zone: zoneId });
      if (r) res.status(200).json({ rooms: r });
      else res.status(400).json({ message: "Not found" });
    } catch (e) {
      res.status(400).json({ message: "Error", error: e });
    }
  } else {
    const r = await Room.find({});
    if (r) res.status(200).json({ rooms: r });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<RoomResponse>
) {
  await connectMongo();
  try {
    const data = roomSchema.parse(req.body);
    await Room.create(data);
    res.status(200).json({ message: "OK" });
  } catch (e) {
    res.status(400).json({ message: "Error", error: e });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<RoomResponse>
) {
  await connectMongo();
  if (req.query.id) {
    try {
      const id = mongoIdSchema.parse(req.query.id);
      const r = await Room.findById(id);
      if (r) {
        try {
          await Room.findByIdAndDelete(id);
          res.status(200).json({ message: "OK" });
        } catch (e) {
          res.status(400).json({ message: "Error", error: e });
        }
      } else {
        res.status(400).json({ message: "Room not found" });
      }
    } catch (e) {
      res.status(400).json({ message: "Error", error: e });
    }
  }
  res.status(400).json({ message: "Missing ID" });
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<RoomResponse>
) {
  if (req.query.id) {
    try {
      const id = mongoIdSchema.parse(req.query.id);
      const roomData = roomSchema.parse(req.body);

      await Room.findOneAndUpdate({ _id: id }, roomData, {});
      res.status(200).json({ message: "OK" });
    } catch (e) {
      res.status(400).json({ message: "Validation error", error: e });
      return;
    }
  }
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<RoomResponse>
) => {
  const session = await getSession({ req });
  if (session && session.user.roles && session.user.roles.includes("builder")) {
    switch (req.method) {
      case "POST":
        await handlePost(req, res);
        return;
      case "GET":
        await handleGet(req, res);
        return;
      case "PUT":
        await handlePut(req, res);
        return;
      case "DELETE":
        await handleDelete(req, res);
        return;
      default:
        res.status(400).json({ message: "Not implemented" });
        return;
    }
  } else {
    res.status(400).json({ message: "Not authorized" });
  }
};
