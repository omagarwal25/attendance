const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
async function main() {
  const data = await prisma.user.findMany({
    include: { _count: { select: { tag: true } } },
  });

  // const filtered = data.filter((u) => u._count.tag === 0);
  console.log(data.map((u) => u.email));
}

main();
