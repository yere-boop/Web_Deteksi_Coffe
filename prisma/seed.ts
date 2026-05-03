import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database with placeholder lecturers...")

  const password = await bcrypt.hash("password123", 10)

  const lecturers = [
    {
      email: "dr.smith@university.edu",
      name: "Dr. Alan Smith",
      password: password,
      role: "LECTURER",
      department: "Computer Science",
    },
    {
      email: "prof.johnson@university.edu",
      name: "Prof. Sarah Johnson",
      password: password,
      role: "LECTURER",
      department: "Mathematics",
    },
    {
      email: "dr.williams@university.edu",
      name: "Dr. James Williams",
      password: password,
      role: "LECTURER",
      department: "Physics",
    }
  ]

  for (const lecturer of lecturers) {
    await prisma.user.upsert({
      where: { email: lecturer.email },
      update: {},
      create: lecturer,
    })
  }

  console.log("Database seeded successfully with 3 placeholder lecturers!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
