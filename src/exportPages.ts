// src/exportPages.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function run() {
  const [pagesRes, redirectsRes] = await Promise.all([
    supabase.from("static_pages").select("*"),
    supabase.from("redirects").select("from_path, to_path")
  ]);

  if (pagesRes.error || redirectsRes.error) {
    console.error("❌ Hiba történt a Supabase lekérdezés során");
    process.exit(1);
  }

  const pages = pagesRes.data.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    html_content: p.html_content,
    created_at: p.created_at,
    updated_at: p.updated_at,
    show_in_menu: true,
    show_in_header: true
  }));

  const aliasMap = new Map();
  redirectsRes.data.forEach((row) => {
    aliasMap.set(row.from_path.replace(/^\\//, ""), row.to_path.replace(/^\\//, ""));
  });

  const aliases = [];
  for (const [aliasSlug, realSlug] of aliasMap.entries()) {
    const original = pages.find((p) => p.slug === realSlug);
    if (original) {
      aliases.push({
        ...original,
        slug: aliasSlug
      });
    }
  }

  const finalPages = [...pages, ...aliases];

  const jsonPath = path.join(process.cwd(), "public/pages.json");
  await fs.writeFile(jsonPath, JSON.stringify(finalPages, null, 2), "utf-8");

  console.log(`✅ ${finalPages.length} oldal exportálva ide: public/pages.json`);
}

run();
