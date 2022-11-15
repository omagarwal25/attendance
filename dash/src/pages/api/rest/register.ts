import argon2 from "argon2";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~env/server.mjs";
import { prisma } from "~server/db/client";

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
  if (!req.body.email) return res.status(400).json({ error: "No Email" });
  const rfid: string = req.body.rfid as string;
  const email: string = req.body.email as string;

  // const tag = await prisma.tag.findUnique({
  //   where: {
  //     uuid: rfid,
  //   },
  // });

  const tags = await prisma.tag.findMany({});
  console.log(tags);
  const tagMap = await Promise.all(
    tags.map((tag) => argon2.verify(tag.uuid, rfid))
  );

  const index = tagMap.indexOf(true);
  const tag = tags[index];

  if (tag) {
    // if the tag is in the database, update the email
    await prisma.tag.update({
      where: {
        id: tag.id,
      },
      data: {
        user: {
          connectOrCreate: {
            where: {
              email,
            },
            create: {
              email,
            },
          },
        },
      },
    });

    return res.status(200).json({ message: "Updated" });
  }

  await prisma.tag.create({
    data: {
      uuid: await argon2.hash(rfid),
      user: {
        connectOrCreate: {
          where: {
            email: email,
          },
          create: {
            email: email,
          },
        },
      },
    },
  });

  res.status(200).json({ success: true });
}
