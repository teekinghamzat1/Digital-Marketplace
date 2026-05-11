"use client";
import { useState } from "react";
import Swal from "sweetalert2";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "Message Sent!",
          text: "We have received your message and will get back to you soon.",
          icon: "success",
          confirmButtonColor: "#f97316",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold font-syne text-foreground mb-4">Get in Touch</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Have questions about our digital products? Our support team is here to help you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-surface border border-border-default rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Email Us</h3>
                <p className="text-text-secondary text-sm">support@sumonmondal.com</p>
              </div>

              <div className="p-6 bg-surface border border-border-default rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">WhatsApp</h3>
                <p className="text-text-secondary text-sm">+8801313839290</p>
              </div>

              <div className="p-6 bg-surface border border-border-default rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  <Send size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Telegram</h3>
                <p className="text-text-secondary text-sm">@smlogsmarket</p>
              </div>

              <div className="p-6 bg-surface border border-border-default rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Business Hours</h3>
                <p className="text-text-secondary text-sm">24/7 Support Available</p>
              </div>
            </div>

            <div className="p-8 bg-primary rounded-3xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">Instant Support?</h2>
                <p className="mb-6 opacity-90">
                  Click the floating WhatsApp button anywhere on the site for immediate assistance from our admin.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => window.open("https://wa.me/8801313839290", "_blank")}
                    className="flex-1 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => window.open("https://t.me/smlogsmarket", "_blank")}
                    className="flex-1 px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all backdrop-blur-md"
                  >
                    Telegram
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-surface border border-border-default rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full bg-background border border-border-default rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full bg-background border border-border-default rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Inquiry about product"
                  className="w-full bg-background border border-border-default rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full bg-background border border-border-default rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
