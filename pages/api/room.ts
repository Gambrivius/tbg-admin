// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import connectMongo from "../../lib/mongo";
import Room from "../../models/room";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { z } from "zod";

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getSession({ req });
  if (session && session.user.roles && session.user.roles.includes("builder")) {
    await connectMongo();
    switch (req.method) {
      case "POST":
        res.status(400).json({ message: "Not implemented" });
        return;
      case "GET":
        res.status(400).json({ message: "Not implemented" });
        return;
      case "PUT":
        res.status(400).json({ message: "Not implemented" });
        return;
      case "DELETE":
        res.status(400).json({ message: "Not implemented" });
        return;
      default:
        res.status(400).json({ message: "Not implemented" });
        return;
    }
  } else {
    res.status(400).json({ message: "Not authorized" });
  }
};
