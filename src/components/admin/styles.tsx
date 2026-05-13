"use client";

export function AdminStyles() {
  return (
    <style jsx global>{`
      :root {
        --color-primary: #E87722;
        --color-primary-hover: #C4621A;
      }

      /* Global resets for admin */
      .admin-layout {
        font-family: var(--font-sans), system-ui, sans-serif;
      }

      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(128, 128, 128, 0.2);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--color-primary);
      }
      
      .vault-card {
        background: var(--surface);
        border: 1px solid var(--border-default);
        border-radius: 1rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .dark .vault-card {
        background: var(--surface);
        border-color: var(--border-default);
      }
      
      .vault-card:hover {
        border-color: rgba(232, 119, 34, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.05);
      }
      .dark .vault-card:hover {
        box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.4);
      }

      .status-badge {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 4px 10px;
        border-radius: 9999px;
      }

      /* Custom scrollbar for sidebar */
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(128, 128, 128, 0.1);
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.05);
      }

      /* Responsive utility for sidebar padding */
      .admin-main {
        padding-top: 4rem; /* h-16 */
        transition: padding-left 0.3s ease;
      }
      
      @media (min-width: 1024px) {
        .admin-main {
          padding-top: 4rem;
          padding-left: 280px;
        }
      }
    `}</style>
  );
}
