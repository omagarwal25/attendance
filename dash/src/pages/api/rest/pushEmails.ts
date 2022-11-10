import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
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

  if (token !== env.GH_ACTIONS_BEARER_TOKEN) return res.status(401).end();

  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);
  // set the time to 00:00
  yesterday.setHours(0, 0, 0, 0);

  // get all the sessions from the past 24 where the endAt is null

  const sessions = await prisma.buildSession.findMany({
    where: {
      startAt: {
        // the start is greater than 24 hours ago
        gte: yesterday,
      },
      // the end is null
      endAt: null,
    },
    include: {
      user: true,
    },
  });

  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SERVER_HOST,
    port: parseInt(env.EMAIL_SERVER_PORT),
    requireTLS: true,
    secure: true,
    auth: {
      // credentials: {
      //   pass: env.EMAIL_SERVER_PASSWORD,
      //   user: env.EMAIL_SERVER_USER,
      // },
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
    from: env.EMAIL_FROM,
  });
  // now we need to send an email to each user
  sessions.forEach(async (session) => {
    await transporter.sendMail({
      from: env.EMAIL_FROM, // sender address
      to: session.user.email, // list of receivers
      subject: "Missing Attendance", // Subject line
      html: `<b>Hey, you forgot to tap in or out to robotic. <a href="${env.NEXTAUTH_URL}/user/${session.user.id}" target="_blank" rel="noreferrer noopener" >Click here to fix it.</a></b>`, // plain text body
    });
  });

  res.status(200).end();
}
