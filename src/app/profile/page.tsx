"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, Shield } from "lucide-react";
import Swal from "sweetalert2";
import { Navbar } from "@/components/navbar";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        router.push("/login");
      }
    } catch (e) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--primary)",
      background: "var(--surface)",
      color: "var(--foreground)",
    });

    if (result.isConfirmed) {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    }
  };

  const handlePasswordChange = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Change Password",
      html: `
        <div class="space-y-4 text-left mt-2">
          <div>
            <label class="block text-sm font-bold text-text-secondary mb-1">Current Password</label>
            <input id="current-password" type="password" class="swal2-input !m-0 !w-full !rounded-xl border-border-default focus:border-primary text-sm p-3" placeholder="Enter current password">
          </div>
          <div>
            <label class="block text-sm font-bold text-text-secondary mb-1">New Password</label>
            <input id="new-password" type="password" class="swal2-input !m-0 !w-full !rounded-xl border-border-default focus:border-primary text-sm p-3" placeholder="Enter new password">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update Password",
      confirmButtonColor: "var(--primary)",
      background: "var(--surface)",
      color: "var(--foreground)",
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-bold',
        cancelButton: 'rounded-xl font-bold'
      },
      preConfirm: () => {
        const currentPassword = (document.getElementById("current-password") as HTMLInputElement).value;
        const newPassword = (document.getElementById("new-password") as HTMLInputElement).value;
        if (!currentPassword || !newPassword) {
          Swal.showValidationMessage("Please fill in both fields");
          return false;
        }
        if (newPassword.length < 6) {
          Swal.showValidationMessage("New password must be at least 6 characters");
          return false;
        }
        return { currentPassword, newPassword };
      }
    });

    if (formValues) {
      try {
        Swal.fire({
          title: "Updating...",
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          background: "var(--surface)",
          color: "var(--foreground)",
        });

        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire({
            title: "Success",
            text: "Password updated successfully.",
            icon: "success",
            confirmButtonColor: "var(--primary)",
            background: "var(--surface)",
            color: "var(--foreground)",
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl font-bold'
            }
          });
        } else {
          Swal.fire({
            title: "Error",
            text: data.error || "Failed to update password",
            icon: "error",
            confirmButtonColor: "var(--primary)",
            background: "var(--surface)",
            color: "var(--foreground)",
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl font-bold'
            }
          });
        }
      } catch (error) {
        Swal.fire("Error", "A network error occurred.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-surface border border-border-default rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.username || "User"}</h2>
              <p className="text-text-secondary">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-xl border border-border-default">
              <p className="text-sm text-text-secondary mb-1">Wallet Balance</p>
              <p className="text-xl font-bold text-foreground">₦{Number(user?.walletBalance || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border-default">
              <p className="text-sm text-text-secondary mb-1">Account Role</p>
              <p className="text-xl font-bold text-foreground capitalize">{user?.role?.toLowerCase() || "User"}</p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <h2 className="text-xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-4">Account Actions</h2>
        <div className="space-y-3">
          <button 
            onClick={() => router.push("/dashboard/settings")}
            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-elevated border border-border-default rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-lg text-text-secondary">
                <Settings size={20} />
              </div>
              <span className="font-bold text-foreground">Account Settings</span>
            </div>
            <span className="text-text-muted">→</span>
          </button>
          
          <button 
            onClick={handlePasswordChange}
            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-elevated border border-border-default rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-lg text-text-secondary">
                <Shield size={20} />
              </div>
              <span className="font-bold text-foreground">Security & Password</span>
            </div>
            <span className="text-text-muted">→</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-error/5 hover:bg-error/10 border border-error/20 rounded-xl transition-colors mt-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-lg text-error">
                <LogOut size={20} />
              </div>
              <span className="font-bold text-error">Log Out</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
