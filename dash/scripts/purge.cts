const { PrismaClient, BuildSession } = require("@prisma/client");

// any person on the database who isn't on this list should be purged

const prisma = new PrismaClient();

// const calculateHoursFromListOfSessions = (sessions) => {
//   const hours = sessions.reduce((acc, session) => {
//     if (!session.endAt) return acc;

//     const diff = session.endAt.getTime() - session.startAt.getTime();
//     const hours = diff / 1000 / 60 / 60;
//     return acc + hours;
//   }, 0);
//   return hours;
// };
//
async function deleteUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  await prisma.buildSession.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.tag.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.user.delete({
    where: {
      id: user.id,
    },
  });
}

const toDelete = `
lidagarwal@gmail.com
  `;

async function main() {
  for (const email of toDelete.split("\n")) {
    await deleteUser(email);
  }
}
main();
