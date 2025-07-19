// src/pages/AdminPage.tsx

import PageList from "@/components/admin/page-list";
import PageForm from "@/components/admin/page-form";
import SEOForm from "@/components/admin/seo-form";
import SlugForm from "@/components/admin/slug-form";
import Form from "@/components/admin/form";

export default function AdminPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin felület</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Oldalak listája</h2>
        <PageList />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Új oldal létrehozása</h2>
        <Form />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Oldal szerkesztés</h2>
        <PageForm />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">SEO beállítások</h2>
        <SEOForm />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Slug beállítás</h2>
        <SlugForm />
      </section>
    </div>
  );
}
