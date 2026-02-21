/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rawVehicles = `0230\t인천경기\tEV3\t9652\t전기
0230\t인천경기\tEV3\t9651\t전기
0230\t인천경기\tIONIQ5\t9745\t전기
0230\t인천경기\t그랜저\t4410\t휘발유
0230\t인천경기\t스타리아(1종보통)\t1253\t경유
0231\t인천중부\tEV3\t9664\t전기
0231\t인천중부\tEV3\t9663\t전기
0231\t인천중부\tEV6\t0491\t전기
0232\t인천남부\tEV3\t9661\t전기
0235\t인천서부\tIONIQ5\t9798\t전기
0236\t인천남동\tEV3\t9659\t전기
0237\t인천부평\tIONIQ5\t9770\t전기
0303\t의정부\tIONIQ5\t9775\t전기
0307\t평택\tEV3\t9662\t전기
0307\t평택\tEV6\t0545\t전기
0307\t평택\tIONIQ5\t9777\t전기
0308\t동두천연천\tIONIQ5\t9743\t전기
0308\t동두천연천\tIONIQ5\t9742\t전기
0309\t안산\tEV6\t0544\t전기
0312\t남양주가평\tEV6\t0430\t전기
0312\t남양주가평\tIONIQ5\t9740\t전기
0312\t남양주가평\tIONIQ5\t9739\t전기
0312\t남양주가평\tEV6(가평)\t0543\t전기
0312\t남양주가평\tIONIQ5(가평)\t9741\t전기
0316\t하남\tEV3\t9653\t전기
0318\t파주\tEV6\t0536\t전기
0318\t파주\tIONIQ5\t9776\t전기
0319\t이천\tIONIQ5\t9774\t전기
0319\t이천\tIONIQ5\t0452\t전기
0320\t김포\tEV3\t9656\t전기
0320\t김포\tIONIQ5\t0481\t전기
0321\t화성\tEV3\t9668\t전기
0321\t화성\tEV3\t9667\t전기
0321\t화성\tEV6\t0546\t전기
0321\t화성\tEV6\t0538\t전기
0321\t화성\tIONIQ5\t9748\t전기
0321\t화성\tIONIQ5\t9747\t전기
0322\t경기광주\tIONIQ5\t9717\t전기
0324\t포천\tIONIQ5\t9778\t전기
0324\t포천\tIONIQ5\t9772\t전기
0324\t포천\tIONIQ5\t9700\t전기
0326\t양평\tIONIQ5\t9746\t전기
0326\t양평\tIONIQ5\t9744\t전기
0327\t수원서부\tEV3\t9665\t전기
0327\t수원서부\tIONIQ5\t0450\t전기
0328\t성남북부\tIONIQ5\t9771\t전기
0329\t양주\tEV3\t9666\t전기
0329\t양주\tIONIQ5\t0447\t전기
0331\t부천남부\tIONIQ5\t0521\t전기
0332\t시흥\tEV6\t0429\t전기
0333\t안성\tEV3\t9655\t전기
0333\t안성\tIONIQ5\t0482\t전기
0335\t여주\tEV6\t0428\t전기
0335\t여주\tIONIQ5\t9773\t전기
0338\t고양일산\tIONIQ5\t9779\t전기
0339\t고양덕양\tEV6\t0537\t전기
0341\t용인동부\tEV3\t9654\t전기
0342\t용인서부\tEV3\t9658\t전기
0342\t용인서부\tEV3\t9657\t전기
0342\t용인서부\tEV6\t0490\t전기
0342\t용인서부\tIONIQ5\t0448\t전기`;

async function main() {
  const vehicles = rawVehicles.split("\n").map((line) => {
    const [branchCode, branchName, model, plate, fuelType] = line.split("\t");
    return { branchCode, branchName, model, plate, fuelType };
  });

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { plate: v.plate },
      update: {
        branchCode: v.branchCode,
        branchName: v.branchName,
        model: v.model,
        fuelType: v.fuelType,
      },
      create: v,
    });
  }

  await prisma.driver.upsert({
    where: { name: "관리자" },
    update: {},
    create: { name: "관리자" },
  });

  console.log(`초기 데이터 등록 완료: ${vehicles.length}대`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
