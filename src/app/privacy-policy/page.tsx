"use client";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/legal", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const p = data.pages?.find((pg: any) => pg.slug === "privacy-policy");
        setPage(p);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-4xl mx-auto px-4 py-16">
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-64 bg-surface-elevated mx-auto rounded"></div>
            <div className="h-[500px] bg-surface-elevated rounded-3xl"></div>
          </div>
        ) : page ? (
          <>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm mb-4">
                <Shield size={16} />
                Official Document
              </div>
              <h1 className="text-5xl font-bold font-syne text-foreground mb-4">{page.title}</h1>
              <p className="text-text-secondary text-lg">
                Last updated: {new Date(page.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-surface border border-border-default rounded-3xl p-8 md:p-12 shadow-sm prose prose-orange max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
            <p className="text-text-secondary mt-2">The requested legal page has not been published yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
