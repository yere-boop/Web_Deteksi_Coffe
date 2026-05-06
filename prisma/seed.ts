import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database with lecturers...")

  const password = await bcrypt.hash("password123", 10)

  // Delete old placeholder lecturers
  await prisma.user.deleteMany({
    where: { role: "LECTURER" },
  })

  const lecturers = [
    {
      email: "stenly.pungus@unklab.ac.id",
      name: "Stenly R. Pungus, S.Kom., MT., M.M., Ph.D",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "semmy.taju@unklab.ac.id",
      name: "Semmy Taju, S.Kom., M.S., Ph.D",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "jimmy.moedjahedy@unklab.ac.id",
      name: "Jimmy Moedjahedy, MM, MKom",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "marchel.tombeng@unklab.ac.id",
      name: "Ir. Marchel T. Tombeng, S.Kom., M.S., IPM",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "andrew.liem@unklab.ac.id",
      name: "Prof. Andrew T. Liem, M.T., Ph.D",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "debby.sondakh@unklab.ac.id",
      name: "Debby E. Sondakh, S.Kom., M.T., Ph.D",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "edson.putra@unklab.ac.id",
      name: "Ir. Edson Y. Putra, M.Kom.",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "george.tangka@unklab.ac.id",
      name: "George M. W. Tangka, S.Kom., MBA",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "green.sandag@unklab.ac.id",
      name: "Green A. Sandag, S.Kom., M.S.",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "jacquline.waworundeng@unklab.ac.id",
      name: "Jacquline M. S. Waworundeng, M.T.",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "joe.mambu@unklab.ac.id",
      name: "Joe Y. Mambu, BSIT, MCIS",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "lidya.laoh@unklab.ac.id",
      name: "Lidya C. Laoh, S.Kom, MMSI",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "oktoverano.lengkong@unklab.ac.id",
      name: "Oktoverano H. Lengkong, S.Kom, M.Ds, MM",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "reymon.rotikan@unklab.ac.id",
      name: "Reymon Rotikan, S.Kom., M.S., M.M.",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "reynoldus.sahulata@unklab.ac.id",
      name: "Reynoldus A. Sahulata, S.Kom., M.M.",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "rolly.lontaan@unklab.ac.id",
      name: "Rolly Lontaan, M.Kom.",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "stenly.adam@unklab.ac.id",
      name: "Stenly I. Adam, S.Kom., M.Sc.",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
    {
      email: "wilsen.mokodaser@unklab.ac.id",
      name: "Wilsen Mokodaser, S.Kom.",
      password: password,
      role: "LECTURER",
      department: "Informatika",
    },
  ]

  for (const lecturer of lecturers) {
    await prisma.user.upsert({
      where: { email: lecturer.email },
      update: { name: lecturer.name, department: lecturer.department },
      create: lecturer,
    })
  }

  console.log(`Database seeded successfully with ${lecturers.length} lecturers!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
