const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

// any person on the database who isn't on this list should be purged

const prisma = new PrismaClient();

const calculateHoursFromListOfSessions = (sessions) => {
  const hours = sessions.reduce((acc, session) => {
    if (!session.endAt) return acc;

    const diff = session.endAt.getTime() - session.startAt.getTime();
    const hours = diff / 1000 / 60 / 60;
    return acc + hours;
  }, 0);
  return hours;
};

async function main() {
  // create a file to write to
  const file = fs.createWriteStream("output.csv");
  const lfile = fs.createWriteStream("sum.csv");

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

  const students = await prisma.user.findMany({
    include: {
      buildSessions: true,
    },
  });

  for (const student of students) {
    const hours = calculateHoursFromListOfSessions(student.buildSessions);
    const line = `${student.email},${hours}\n`;
    lfile.write(line);
  }

  lfile.end();
  file.end();
}

main();
