import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add caption field to media table, but only if it doesn't already exist
  const columnExists = await db.run(sql`PRAGMA table_info('media');`)
  const hasCaption = (columnExists.results as { name: string }[]).some(
    (row) => row.name === 'caption',
  )

  if (!hasCaption) {
    await db.run(sql`ALTER TABLE \`media\` ADD \`caption\` text;`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove caption field from media table
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // Recreate media table without caption field
  await db.run(sql`CREATE TABLE \`media_new\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`alt\` text NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`url\` text,
    \`thumbnail_u_r_l\` text,
    \`filename\` text,
    \`mime_type\` text,
    \`filesize\` numeric,
    \`width\` numeric,
    \`height\` numeric
  );`)

  // Copy data from old table to new table (excluding caption)
  await db.run(sql`INSERT INTO \`media_new\` SELECT 
    \`id\`, \`alt\`, \`updated_at\`, \`created_at\`, \`url\`, \`thumbnail_u_r_l\`, 
    \`filename\`, \`mime_type\`, \`filesize\`, \`width\`, \`height\`
    FROM \`media\`;`)

  // Drop old table and rename new one
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`ALTER TABLE \`media_new\` RENAME TO \`media\`;`)

  // Recreate indexes
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
