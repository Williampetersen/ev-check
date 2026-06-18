const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const services = [
    {
      id: "battery-health",
      title: "Batteritest af elbil",
      slug: "batteritest-af-elbil",
      description:
        "Professionel batteridiagnose med SoH, SoC, cellebalance og klar PDF-rapport.",
      durationMinutes: 15,
      price: 1300,
      currency: "DKK",
      isActive: true,
    },
    {
      id: "pre-purchase-check",
      title: "Købstjek af elbil",
      slug: "koebstjek-af-elbil",
      description:
        "Ekstra grundigt tjek før køb med batteritest, systemdata og praktisk rådgivning.",
      durationMinutes: 45,
      price: 1995,
      currency: "DKK",
      isActive: true,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });

    for (const weekday of [1, 2, 3, 4, 5]) {
      await prisma.availability.upsert({
        where: { id: `${service.id}-${weekday}` },
        update: {
          startTime: "09:00",
          endTime: "18:00",
          slotIntervalMinutes: 15,
          isActive: true,
        },
        create: {
          id: `${service.id}-${weekday}`,
          serviceId: service.id,
          weekday,
          startTime: "09:00",
          endTime: "18:00",
          slotIntervalMinutes: 15,
          isActive: true,
        },
      });
    }
  }

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@ev-check.dk" },
    update: {},
    create: {
      id: "admin_default",
      name: "EV-Check Admin",
      email: process.env.ADMIN_EMAIL || "admin@ev-check.dk",
      passwordHash:
        process.env.ADMIN_PASSWORD_HASH ||
        "replace-with-a-real-password-hash-before-production",
      role: "admin",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
