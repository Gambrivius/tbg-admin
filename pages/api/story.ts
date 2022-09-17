// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import connectMongo from "../../lib/mongo";
import StoryText from "../../models/story";

import { zStoryTextSchema, APIStoryResponse } from "../../models/story";

import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { z } from "zod";

const mongoIdSchema = z.string().length(24);

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<APIStoryResponse>
) {
  await connectMongo();

  if (req.query.id) {
    try {
      const id = mongoIdSchema.parse(req.query.id);
      const results = await StoryText.findById(id);
      if (results) res.status(200).json({ data: [results] });
      else res.status(400).json({ message: "Not found" });
    } catch (e) {
      res.status(400).json({ message: "Error", error: e });
    }
  } else if (req.query.zone) {
    try {
      const zoneId = mongoIdSchema.parse(req.query.zone);

      const results = await StoryText.find({ zone: zoneId });
      if (results) res.status(200).json({ data: results });
      else res.status(400).json({ message: "Not found" });
    } catch (e) {
      res.status(400).json({ message: "Error", error: e });
    }
  } else {
    const results = await StoryText.find({});
    if (results) res.status(200).json({ data: results });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<APIStoryResponse>
) {
  await connectMongo();
  try {
    const data = zStoryTextSchema.parse(req.body);
    await StoryText.create(data);
    res.status(200).json({ message: "OK" });
  } catch (e) {
    res.status(400).json({ message: "Error", error: e });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<APIStoryResponse>
) {
  await connectMongo();
  if (req.query.id) {
    try {
      const id = mongoIdSchema.parse(req.query.id);
      const results = await StoryText.findById(id);
      if (results) {
        try {
          await StoryText.findByIdAndDelete(id);
          res.status(200).json({ message: "OK" });
          return;
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
  res: NextApiResponse<APIStoryResponse>
) {
  if (req.query.id) {
    try {
      const id = mongoIdSchema.parse(req.query.id);
      const data = zStoryTextSchema.parse(req.body);

      await StoryText.findOneAndUpdate({ _id: id }, data, {});
      res.status(200).json({ message: "OK" });
    } catch (e) {
      res.status(400).json({ message: "Validation error", error: e });
      return;
    }
  }
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<APIStoryResponse>
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
