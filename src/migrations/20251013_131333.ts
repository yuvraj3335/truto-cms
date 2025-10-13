import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add new fields to articles table
  await db.run(sql`ALTER TABLE \`articles\` ADD \`slug\` text;`)
  await db.run(sql`ALTER TABLE \`articles\` ADD \`excerpt\` text;`)
  await db.run(sql`ALTER TABLE \`articles\` ADD \`cover_image_id\` integer REFERENCES media(id);`)

  // Create indexes for the new fields
  await db.run(sql`CREATE UNIQUE INDEX \`articles_slug_idx\` ON \`articles\` (\`slug\`);`)
  await db.run(
    sql`CREATE INDEX \`articles_cover_image_id_idx\` ON \`articles\` (\`cover_image_id\`);`,
  )

  // Update existing records to have slugs based on titles (if any exist)
  // This handles existing data gracefully
  await db.run(
    sql`UPDATE \`articles\` SET \`slug\` = LOWER(REPLACE(REPLACE(\`title\`, ' ', '-'), '''', '')) WHERE \`slug\` IS NULL;`,
  )

  // Now make slug NOT NULL after populating existing records
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // Recreate table with proper constraints
  await db.run(sql`CREATE TABLE \`articles_new\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`slug\` text NOT NULL UNIQUE,
    \`excerpt\` text NOT NULL DEFAULT '',
    \`cover_image_id\` integer REFERENCES media(id),
    \`content\` text NOT NULL,
    \`author\` text NOT NULL,
    \`published_date\` text NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)

  // Copy data from old table to new table
  await db.run(sql`INSERT INTO \`articles_new\` SELECT 
    \`id\`, \`title\`, \`slug\`, COALESCE(\`excerpt\`, ''), \`cover_image_id\`, 
    \`content\`, \`author\`, \`published_date\`, \`updated_at\`, \`created_at\`
    FROM \`articles\`;`)

  // Drop old table and rename new one
  await db.run(sql`DROP TABLE \`articles\`;`)
  await db.run(sql`ALTER TABLE \`articles_new\` RENAME TO \`articles\`;`)

  // Recreate indexes
  await db.run(sql`CREATE INDEX \`articles_updated_at_idx\` ON \`articles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`articles_created_at_idx\` ON \`articles\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_slug_idx\` ON \`articles\` (\`slug\`);`)
  await db.run(
    sql`CREATE INDEX \`articles_cover_image_id_idx\` ON \`articles\` (\`cover_image_id\`);`,
  )

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Revert to original table structure
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  await db.run(sql`CREATE TABLE \`articles_old\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`content\` text NOT NULL,
    \`author\` text NOT NULL,
    \`published_date\` text NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)

  await db.run(sql`INSERT INTO \`articles_old\` SELECT 
    \`id\`, \`title\`, \`content\`, \`author\`, \`published_date\`, \`updated_at\`, \`created_at\`
    FROM \`articles\`;`)

  await db.run(sql`DROP TABLE \`articles\`;`)
  await db.run(sql`ALTER TABLE \`articles_old\` RENAME TO \`articles\`;`)

  await db.run(sql`CREATE INDEX \`articles_updated_at_idx\` ON \`articles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`articles_created_at_idx\` ON \`articles\` (\`created_at\`);`)

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
