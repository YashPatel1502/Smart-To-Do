import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  await prisma.task.createMany({
    data: [
      {
        title: "Plan product requirements",
        description: "Outline MVP scope and success metrics for smart to-do app.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        category: "Product",
        dueDate: nextWeek,
      },
      {
        title: "Draft onboarding email copy",
        description: "Write first-version email for new task notifications.",
        priority: "MEDIUM",
        status: "PENDING",
        category: "Marketing",
        dueDate: tomorrow,
      },
      {
        title: "QA responsive UI",
        description: "Verify desktop/mobile breakpoints and interaction states.",
        priority: "LOW",
        status: "COMPLETED",
        category: "QA",
        completedAt: now,
        calendarSync: false,
        emailNotification: false,
      },
    ],
  });

  console.log("Database seeded with sample tasks ✅");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
