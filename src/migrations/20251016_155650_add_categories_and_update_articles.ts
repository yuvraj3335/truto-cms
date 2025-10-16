import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // Helper function to execute SQL and ignore specific errors
  const executeSql = async (sqlStatement: string) => {
    try {
      await payload.db.drizzle.run(sql.raw(sqlStatement))
    } catch (error: any) {
      // Ignore "already exists" errors
      if (!error.message?.includes('already exists')) {
        throw error
      }
    }
  }

  // Create categories table
  await executeSql(`
    CREATE TABLE IF NOT EXISTS "categories" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "name" text NOT NULL,
      "slug" text NOT NULL,
      "description" text,
      "cover_image_id" integer,
      "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      FOREIGN KEY ("cover_image_id") REFERENCES "media"("id") ON UPDATE no action ON DELETE set null
    )
  `)

  // Create indexes for categories
  await executeSql(
    `CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" ("slug")`,
  )
  await executeSql(
    `CREATE INDEX IF NOT EXISTS "categories_created_at_idx" ON "categories" ("created_at")`,
  )
  await executeSql(
    `CREATE INDEX IF NOT EXISTS "categories_cover_image_idx" ON "categories" ("cover_image_id")`,
  )

  // Add new fields to articles table
  try {
    await executeSql(`ALTER TABLE "articles" ADD COLUMN "published_at" text`)
  } catch (error: any) {
    if (!error.message?.includes('duplicate column name')) {
      throw error
    }
  }

  try {
    await executeSql(`ALTER TABLE "articles" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL`)
  } catch (error: any) {
    if (!error.message?.includes('duplicate column name')) {
      throw error
    }
  }

  try {
    await executeSql(`ALTER TABLE "articles" ADD COLUMN "seo_title" text`)
  } catch (error: any) {
    if (!error.message?.includes('duplicate column name')) {
      throw error
    }
  }

  try {
    await executeSql(`ALTER TABLE "articles" ADD COLUMN "seo_description" text`)
  } catch (error: any) {
    if (!error.message?.includes('duplicate column name')) {
      throw error
    }
  }

  try {
    await executeSql(`ALTER TABLE "articles" ADD COLUMN "seo_image_id" integer`)
  } catch (error: any) {
    if (!error.message?.includes('duplicate column name')) {
      throw error
    }
  }

  // Create articles_tags table for tag arrays
  await executeSql(`
    CREATE TABLE IF NOT EXISTS "articles_tags" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      FOREIGN KEY ("_parent_id") REFERENCES "articles"("id") ON UPDATE no action ON DELETE cascade
    )
  `)

  // Create articles_rels table for category relationships
  await executeSql(`
    CREATE TABLE IF NOT EXISTS "articles_rels" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" text NOT NULL,
      "categories_id" integer,
      FOREIGN KEY ("parent_id") REFERENCES "articles"("id") ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON UPDATE no action ON DELETE cascade
    )
  `)

  // Create indexes for articles_tags
  await executeSql(
    `CREATE INDEX IF NOT EXISTS "articles_tags_order_idx" ON "articles_tags" ("_order")`,
  )
  await executeSql(
    `CREATE INDEX IF NOT EXISTS "articles_tags_parent_id_idx" ON "articles_tags" ("_parent_id")`,
  )

  // Create indexes for articles_rels
  await executeSql(
    `CREATE INDEX IF NOT EXISTS "articles_rels_order_idx" ON "articles_rels" ("order")`,
  )
  await executeSql(
    `CREATE INDEX IF NOT EXISTS "articles_rels_parent_idx" ON "articles_rels" ("parent_id")`,
  )
  await executeSql(
    `CREATE INDEX IF NOT EXISTS "articles_rels_path_idx" ON "articles_rels" ("path")`,
  )
  await executeSql(
    `CREATE INDEX IF NOT EXISTS "articles_rels_categories_id_idx" ON "articles_rels" ("categories_id")`,
  )

  // Update existing articles to have default status 'published' if they exist
  try {
    await payload.db.drizzle.run(
      sql`UPDATE "articles" SET "status" = 'published' WHERE "status" IS NULL OR "status" = ''`,
    )
  } catch (error) {
    // Ignore if status column doesn't exist yet
  }

  // Sync publishedAt with publishedDate for existing articles
  try {
    await payload.db.drizzle.run(
      sql`UPDATE "articles" SET "published_at" = "published_date" WHERE "published_at" IS NULL`,
    )
  } catch (error) {
    // Ignore if columns don't exist yet
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.run(sql`
    -- Drop articles_rels table
    DROP TABLE IF EXISTS "articles_rels";

    -- Drop articles_tags table
    DROP TABLE IF EXISTS "articles_tags";

    -- Drop categories table
    DROP TABLE IF EXISTS "categories";

    -- Note: Removing columns from articles table (published_at, status, seo_title, seo_description, seo_image_id)
    -- SQLite doesn't support DROP COLUMN easily, so these columns will remain
    -- In a production environment, you might want to recreate the table without these columns
  `)
}
