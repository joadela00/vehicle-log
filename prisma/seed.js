const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const vehicles = [
    { model: "아이오닉5", plate: "9745" },
    { model: "EV3", plate: "9652" },
    { model: "EV3", plate: "9651" },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { plate: v.plate },
      update: {},
      create: v,
    });
  }

  await prisma.driver.upsert({
    where: { name: "관리자" },
    update: {},
    create: { name: "관리자" },
  });

  console.log("초기 데이터 등록 완료");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
