"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Gavel, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm mb-4">
            <Gavel size={16} />
            Legal Agreement
          </div>
          <h1 className="text-5xl font-bold font-syne text-foreground mb-4">Terms & Conditions</h1>
          <p className="text-text-secondary text-lg">
            Last updated: May 4, 2026
          </p>
        </div>

        <div className="bg-surface border border-border-default rounded-3xl p-8 md:p-12 shadow-sm space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <CheckCircle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Acceptance of Terms</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Digital Products & Refunds</h2>
            </div>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>Since our website offers non-tangible, irrevocable digital goods, we do not provide refunds after the product is purchased, which you acknowledge prior to buying any product on the website.</p>
              <p>Please make sure that you've carefully read the product description before making a purchase. If you encounter any issues with the delivered product, please contact our support via WhatsApp immediately.</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Gavel size={20} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Account Responsibilities</h2>
            </div>
            <p className="text-text-secondary leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or mobile device. You agree to accept responsibility for all activities that occur under your account or password.
            </p>
          </section>

          <section className="bg-surface-elevated p-8 rounded-2xl border border-border-default">
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <HelpCircle size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Questions?</h2>
            </div>
            <p className="text-text-secondary">
              If you have any questions regarding these Terms & Conditions, please reach out to us through our contact page or via WhatsApp.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
