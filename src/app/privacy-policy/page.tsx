"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm mb-4">
            <Shield size={16} />
            Data Protection
          </div>
          <h1 className="text-5xl font-bold font-syne text-foreground mb-4">Privacy Policy</h1>
          <p className="text-text-secondary text-lg">
            Last updated: May 4, 2026
          </p>
        </div>

        <div className="bg-surface border border-border-default rounded-3xl p-8 md:p-12 shadow-sm space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              At Sumon Mondal Marketplace, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Eye size={20} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Data We Collect</h2>
            </div>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity Data:</strong> includes username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                <li><strong>Financial Data:</strong> includes wallet balance and transaction history.</li>
                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, login data, browser type and version, and platform.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Lock size={20} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">How We Use Your Data</h2>
            </div>
            <p className="text-text-secondary leading-relaxed mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal or regulatory obligation.</li>
            </ul>
          </section>

          <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
            <h2 className="text-xl font-bold text-foreground mb-4">Contact Our Privacy Officer</h2>
            <p className="text-text-secondary mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p className="font-bold text-primary">privacy@sumonmondal.com</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
