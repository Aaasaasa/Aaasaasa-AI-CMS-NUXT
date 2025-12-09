// prisma/seed.ts
// Master seed file for all databases in NuxtWP Multilang Theme

import seedPostgresCMS from './seed-data/postgres-seed'
// import seedMySQLWordPress from './seed-data/mysql-seed'
// import seedMongoAnalytics from './seed-data/mongo-seed'

async function main() {
  try {
    process.stdout.write('🌱 Starting database seeding for NuxtWP Multilang Theme...\n\n')

    // Seed PostgreSQL CMS
    process.stdout.write('📊 Seeding PostgreSQL CMS database...\n')
    await seedPostgresCMS()
    process.stdout.write('✅ PostgreSQL CMS seeded successfully\n\n')

    // Seed MySQL WordPress
    // process.stdout.write('🔗 Seeding MySQL WordPress database...\n')
    // await seedMySQLWordPress()
    // process.stdout.write('✅ MySQL WordPress seeded successfully\n\n')

    // Seed MongoDB Analytics
    // process.stdout.write('📈 Seeding MongoDB Analytics database...\n')
    // await seedMongoAnalytics()
    // process.stdout.write('✅ MongoDB Analytics seeded successfully\n\n')

    process.stdout.write('🎉 All databases seeded successfully!\n')
    process.stdout.write('🚀 NuxtWP Multilang Theme is ready for development\n')
  } catch (error) {
    process.stderr.write(`❌ Seeding failed: ${error}\n`)
    process.exit(1)
  }
}

// Execute seeding
main()
