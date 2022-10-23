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

  // get all the sessions from the past 24 where the endAt is null

  const sessions = await prisma.buildSession.findMany({
    where: {
      startAt: {
        // the start is greater than 24 hours ago
        gte: new Date(new Date().setHours(new Date().getHours() - 24)),
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
    auth: {
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
  });
  // now we need to send an email to each user
  sessions.forEach(async (session) => {
    const info = await transporter.sendMail({
      from: '"Robotics Attendance <robotics_attendance@asl.org>', // sender address
      to: session.user.email, // list of receivers
      subject: "Robotics Attendance", // Subject line
      text: "Hello world?", // plain text body
      html: `<b>Hello world?</b>`, // html body
    });
  });
}
