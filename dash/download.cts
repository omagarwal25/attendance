const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

// any person on the database who isn't on this list should be purged

const prisma = new PrismaClient();

async function main() {
  // create a file to write to
  const file = fs.createWriteStream("output.csv");

  const sessions = await prisma.buildSession.findMany({
    include: {
      user: true,
    },
  });

  for (const session of sessions) {
    // convert the start at to HH:MM and the end at to HH:MM in 24 hour time
    const startAt = new Date(session.startAt).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const endAt = new Date(session.endAt).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    // date in DD/MM/YYYY format
    const date = new Date(session.startAt).toLocaleDateString("en-GB");

    const line = `${session.user.email},${date},${startAt},${endAt}\n`;

    console.log(line);

    file.write(line);
  }

  file.end();
}

main();
