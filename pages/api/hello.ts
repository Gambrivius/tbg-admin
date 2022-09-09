// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

type Data = {
  name?: string;
  message?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getSession({ req });
  if (session && session.user.roles.includes("admin")) {
    res.status(200).json({ name: "John Doe" });
  } else {
    res.status(400).json({ message: "Not authorized" });
  }
};
