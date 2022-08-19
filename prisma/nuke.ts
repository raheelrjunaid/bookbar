import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  if (!prisma) throw new Error("prisma is not defined");
  const models = Object.keys(prisma).filter((key) => key[0] !== "_");

  const promises = models.map((name) => {
    // @ts-expect-error
    return prisma[name].deleteMany();
  });

  return await Promise.all(promises);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
