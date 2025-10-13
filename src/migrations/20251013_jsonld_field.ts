import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add jsonLd field to articles table, but only if it doesn't already exist
  const columnExists = await db.run(sql`PRAGMA table_info('articles');`)
  const hasJsonLd = (columnExists.results as { name: string }[]).some(
    (row) => row.name === 'json_ld',
  )

  if (!hasJsonLd) {
    await db.run(sql`ALTER TABLE \`articles\` ADD \`json_ld\` text;`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove jsonLd field from articles table
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // Get the current table structure
  const tableInfo = await db.run(sql`PRAGMA table_info('articles');`)
  const columns = (tableInfo.results as { name: string }[])
    .filter((row) => row.name !== 'json_ld')
    .map((row) => row.name)
    .join(', ')

  // Create new table without json_ld field
  await db.run(sql`CREATE TABLE \`articles_new\` AS SELECT ${sql.raw(columns)} FROM \`articles\`;`)

  // Drop old table and rename new one
  await db.run(sql`DROP TABLE \`articles\`;`)
  await db.run(sql`ALTER TABLE \`articles_new\` RENAME TO \`articles\`;`)

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
