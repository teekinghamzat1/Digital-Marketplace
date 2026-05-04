import React from "react";
import Link from "next/link";
import { Mail, Globe, Shield, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-background py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Section */}
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-bold font-syne text-primary mb-4 inline-block">
            Sumon Mondal Logs
          </Link>
          <p className="text-text-secondary max-w-sm mb-6">
            The most trusted digital marketplace for verified accounts. 
            Instant delivery, secure payments, and 24/7 automated processing.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-secondary hover:text-primary transition-colors border border-border-default">
              <Globe size={18} />
            </a>
            <a href="https://wa.me/8801313839290" target="_blank" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-secondary hover:text-primary transition-colors border border-border-default">
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <a href="https://t.me/smlogsmarket" target="_blank" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-secondary hover:text-primary transition-colors border border-border-default">
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.257.257-.527.257l.184-2.618 4.77-4.312c.207-.184-.045-.286-.32-.103l-5.895 3.714-2.541-.795c-.553-.173-.564-.553.115-.819l9.934-3.829c.46-.17.863.106.71.813z"/>
              </svg>
            </a>
            <a href="mailto:support@sumonmondal.com" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-secondary hover:text-primary transition-colors border border-border-default">
              <Mail size={18} />
            </a>
            <a href="mailto:support@sumonmondal.com" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-secondary hover:text-primary transition-colors border border-border-default">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-foreground mb-6">Marketplace</h4>
          <ul className="space-y-4">
            <li>
              <Link href="/shop" className="text-text-secondary hover:text-primary transition-colors">
                Browse Shop
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-text-secondary hover:text-primary transition-colors">
                My Dashboard
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-text-secondary hover:text-primary transition-colors">
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-bold text-foreground mb-6">Legal</h4>
          <ul className="space-y-4">
            <li>
              <Link href="/privacy-policy" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2">
                <Shield size={16} />
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2">
                <FileText size={16} />
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border-default flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
        <p>© {new Date().getFullYear()} Sumon Mondal Logs Marketplace. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span>Automated by Sumon Systems</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
