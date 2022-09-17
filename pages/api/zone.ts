// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import connectMongo from "../../lib/mongo";
import Zone from "../../models/zone";
import { IZone, APIZoneResponse } from "../../models/zone";
import Room from "../../models/room";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { z } from "zod";

const postZoneSchema = z.object({
  name: z.string().min(1).max(40),
});

const zoneIdSchema = z.object({
  id: z.string().length(24),
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<APIZoneResponse>
) => {
  const session = await getSession({ req });
  if (session && session.user.roles && session.user.roles.includes("builder")) {
    await connectMongo();
    switch (req.method) {
      case "POST":
        try {
          const data = postZoneSchema.parse(req.body);
          try {
            const test = await Zone.create(data);
            res.status(200).json({ message: "OK" });
          } catch (e) {
            res.status(400).json({ message: "Error", error: e });
          }
        } catch (e) {
          res.status(400).json({ message: "Validation Error", error: e });
        }
        return;
      case "GET":
        if (!req.query.id) {
          const z = await Zone.find({});
          if (z) res.status(200).json({ data: z });
          return;
        }
        try {
          const data = zoneIdSchema.parse(req.query);

          try {
            const z = await Zone.findById(data.id);
            if (z) res.status(200).json({ data: [z] });
            else res.status(400).json({ message: "Not found" });
          } catch (e) {
            res.status(400).json({ message: "Error", error: e });
          }
        } catch (e) {
          res.status(400).json({ message: "Validation Error", error: e });
        }
        return;
      case "PUT":
        try {
          const queryData = zoneIdSchema.parse(req.query);
          const bodyData = postZoneSchema.parse(req.body);
          try {
            const z = await Zone.findOneAndUpdate(
              { _id: queryData.id },
              bodyData
            );
            if (z) {
              try {
                z.updateOne(bodyData);
                res.status(200).json({ message: "OK" });
              } catch (e) {
                res.status(400).json({ message: "Error", error: e });
              }
            } else res.status(400).json({ message: "Not found" });
          } catch (e) {
            res.status(400).json({ message: "Error", error: e });
          }
        } catch (e) {
          res.status(400).json({ message: "Validation Error", error: e });
        }
        return;
      case "DELETE":
        try {
          const data = zoneIdSchema.parse(req.query);
          try {
            const z = await Zone.findById(data.id);
            if (z) {
              try {
                try {
                  const rooms = await Room.find({ zone: data.id });
                  if (rooms.length === 0) {
                    try {
                      await Zone.findByIdAndDelete(data.id);
                    } catch (e) {
                      res.status(400).json({ message: "Error", error: e });
                    }
                    res.status(200).json({ message: "OK" });
                  } else {
                    res.status(400).json({ message: "Zone is not empty" });
                  }
                } catch (e) {
                  res.status(400).json({ message: "Error", error: e });
                }
              } catch (e) {
                res.status(400).json({ message: "Error", error: e });
              }
            } else res.status(400).json({ message: "Not found" });
          } catch (e) {
            res.status(400).json({ message: "Error", error: e });
          }
        } catch (e) {
          res.status(400).json({ message: "Validation Error", error: e });
        }
        return;

      default:
        res.status(400).json({ message: "Not authorized" });
        return;
    }
  } else {
    res.status(400).json({ message: "Not authorized" });
  }
};
