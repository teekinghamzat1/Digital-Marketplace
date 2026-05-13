"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash2, Edit, Globe, Shield, FileText, ChevronRight, Layout } from "lucide-react";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function AdminLegalPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/legal", { credentials: "include" });
      const data = await res.json();
      setPages(data.pages || []);
    } catch (err) {
      console.error("Failed to fetch pages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: any) => {
    setEditingPage(page || { title: "", slug: "", content: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage.title || !editingPage.slug || !editingPage.content) {
      return Swal.fire("Error", "All fields are required", "error");
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPage),
        credentials: "include",
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Page Saved",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
        });
        setEditingPage(null);
        fetchPages();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save page");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This page will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/legal?id=${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          Swal.fire("Deleted!", "The page has been deleted.", "success");
          fetchPages();
        }
      } catch (err) {
        console.error("Failed to delete page:", err);
      }
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
    ],
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-syne text-foreground tracking-tight">Legal Pages</h1>
          <p className="text-text-secondary mt-1 text-lg">Manage Privacy Policy, Terms & Conditions, and other legal content.</p>
        </div>

        {!editingPage && (
          <button
            onClick={() => handleEdit(null)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus size={20} />
            Create New Page
          </button>
        )}
      </div>

      {editingPage ? (
        <div className="animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="vault-card p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <h2 className="text-2xl font-bold font-syne text-foreground flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Edit size={20} />
                  </div>
                  {editingPage.id ? "Edit Legal Page" : "New Legal Page"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="text-text-secondary hover:text-foreground font-bold text-sm"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Page Title</label>
                  <input
                    type="text"
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all"
                    placeholder="Privacy Policy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">URL Slug</label>
                  <input
                    type="text"
                    value={editingPage.slug}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                    className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all font-mono"
                    placeholder="privacy-policy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Content (Rich Text Editor)</label>
                <div className="bg-surface-elevated rounded-xl overflow-hidden border border-border-default min-h-[400px]">
                  <ReactQuill
                    theme="snow"
                    value={editingPage.content}
                    onChange={(content) => setEditingPage({ ...editingPage, content })}
                    modules={modules}
                    className="h-full bg-white text-black"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end fixed bottom-8 right-8 z-[50]">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/40 border border-white/20"
              >
                {saving ? "Saving..." : <><Save size={22} /> Save Legal Page</>}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-48 bg-surface-elevated animate-pulse rounded-2xl border border-border-default" />)
          ) : pages.length === 0 ? (
            <div className="col-span-full vault-card p-16 text-center border-dashed">
              <div className="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted">
                <FileText size={40} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">No Legal Pages Found</h2>
              <p className="text-text-secondary mt-2">Start by creating your first legal document.</p>
            </div>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="vault-card p-6 flex flex-col justify-between group hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Shield size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(page)}
                        className="p-2 hover:bg-surface-elevated rounded-lg text-text-muted hover:text-primary transition-colors"
                        title="Edit Page"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-2 hover:bg-surface-elevated rounded-lg text-text-muted hover:text-error transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">{page.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-surface-elevated p-2 rounded-lg mb-4">
                    <Globe size={14} />
                    /{page.slug}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border-default">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    Updated: {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                  <a 
                    href={`/${page.slug}`} 
                    target="_blank"
                    className="text-primary hover:underline text-sm font-bold flex items-center gap-1"
                  >
                    View Live <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
