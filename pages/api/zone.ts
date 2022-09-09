// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import connectMongo from "../../lib/mongo";
import Zone from "../../models/zone";
import IZone from "../../models/zone";
import Room from "../../models/room";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { z } from "zod";

const postZoneSchema = z.object({
  name: z.string().min(1).max(15),
});

const zoneIdSchema = z.object({
  id: z.string().length(24),
});

type ResponseData = {
  message?: string;
  error?: any;
  zones?: typeof IZone[];
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const session = await getSession({ req });
  if (session && session.user.roles && session.user.roles.includes("builder")) {
    await connectMongo();
    switch (req.method) {
      case "POST":
        try {
          console.log(req.body);
          const data = postZoneSchema.parse(req.body);
          console.log(req.body);
          try {
            const test = await Zone.create(data);
            console.log("HERE");
            res.status(200).json({ message: "OK" });
          } catch (e) {
            console.log(e);
            res.status(400).json({ message: "Error", error: e });
          }
        } catch (e) {
          res.status(400).json({ message: "Validation Error", error: e });
        }
        return;
      case "GET":
        if (!req.query.id) {
          const z = await Zone.find({});
          if (z) res.status(200).json({ zones: z });
          return;
        }
        try {
          const data = zoneIdSchema.parse(req.query);

          try {
            const z = await Zone.findById(data.id);
            if (z) res.status(200).json({ zones: z });
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
                console.log(e);
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
