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
  const rfid: string = req.body.rfid as string;

  // find the user with the rfid
  const tag = await prisma.tag.findUnique({
    where: {
      uuid: hashed,
    },
    include: {
      user: true,
    },
  });

  // because we are using argon2, we need to use it to compare the rfid
  // const tags = await prisma.tag.findMany({
  //   include: {
  //     user: true,
  //   },
  // });
  // console.log(tags);
  // const tagMap = await Promise.all(
  //   tags.map(async (tag) => ({
  //     match: await argon2.verify(tag.uuid, rfid),
  //     id: tag.id,
  //     user: tag.user,
  //   }))
  // );

  // const tag = tagMap.find((tag) => tag.match);

  const user = tag?.user;

  if (!user) return res.status(404).json({ error: "User not found" });

  // alright we have the user now. Let's filter their sessions

  const session = await prisma.buildSession.findFirst({
    where: {
      userId: user.id,
      startAt: {
        // the start is today
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
      // the end is null
      endAt: null,
    },
  });

  // if the session is null, then we need to create a new session
  if (!session) {
    await prisma.buildSession.create({
      data: {
        startAt: new Date(),
        userId: user.id,
      },
    });

    return res.status(200).json({ message: "Successful", start: true });
  } else {
    // otherwise we need to end the session
    await prisma.buildSession.update({
      where: {
        id: session.id,
      },
      data: {
        endAt: new Date(),
      },
    });

    return res.status(200).json({ message: "Successful", start: false });
  }
}
