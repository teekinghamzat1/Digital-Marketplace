"use client";

export function AdminStyles() {
  return (
    <style jsx global>{`
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #E87722;
      }
      
      .vault-card {
        background: #1a1a1a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .vault-card:hover {
        border-color: rgba(232, 119, 34, 0.3);
        box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.5);
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
        background: rgba(255, 255, 255, 0.05);
      }
      .custom-scrollbar:hover::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
      }
    `}</style>
  );
}
