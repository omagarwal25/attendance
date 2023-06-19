import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~env/server.mjs";
import { prisma } from "~server/db/client";
import { colors } from "~utils/color";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== "POST") return res.status(405).end();
  // auth the raspberry pi

  // get the auth token from the request using bearer token
  const token = req.headers.authorization?.split(" ")[1];

  if (token !== env.PI_BEARER_TOKEN) return res.status(401).end();

  // Get data from your database
  if (!req.body.rfid) return res.status(400).json({ error: "No RFID" });
  const rfid: string = req.body.rfid as string;

  // find the user with the rfid
  const tag = await prisma.tag.findUnique({
    where: {
      uuid: rfid,
    },
    include: {
      user: true,
    },
  });

  const user = tag?.user;

  if (user) return res.status(501).json({ error: "User already exists" });

  if (tag && tag.sequence) {
    return res.status(200).json({ data: tag.sequence, message: "Successful" });
  }
  // we need to generate a unique sequence consisting of three colors.
  // the best way to do this to have a list of colors and then randomly select three of them
  // then we need to check if the sequence is unique
  // if it is not unique, we need to generate a new sequence
  // if it is unique, we need to save it to the database

  const colorLength = colors.length;

  while (true) {
    const seuqence = [
      Math.floor(Math.random() * colorLength),
      Math.floor(Math.random() * colorLength),
      Math.floor(Math.random() * colorLength),
    ]
      .map((i) => colors[i])
      .join(",");

    const tagWithSequence = await prisma.tag.findFirst({
      where: {
        sequence: seuqence,
        userId: null,
      },
    });

    if (!tagWithSequence) {
      if (tag)
        await prisma.tag.update({
          where: {
            uuid: rfid,
          },
          data: {
            sequence: seuqence,
          },
        });
      else
        await prisma.tag.create({
          data: {
            uuid: rfid,
            sequence: seuqence,
          },
        });
      return res.status(200).json({ data: seuqence, message: "Successful" });
    }
  }
}
