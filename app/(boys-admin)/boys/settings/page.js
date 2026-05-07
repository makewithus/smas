"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Info,
} from "lucide-react";
import { auth } from "@/src/lib/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import { useAuth } from "@/src/context/AuthContext";

const T = {
  green: "#1B4332",
  text: "#3D3227",
  muted: "#8C7B6B",
  border: "#E8DFD4",
  bg: "#F5EFE8",
  accent: "#D39542",
};

export default function BoysSettingsPage() {
  const { userProfile } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.current) {
      toast.error("Enter your current password");
      return;
    }
    if (pwForm.newPw.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setPwLoading(true);
      const user = auth.currentUser;
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, pwForm.current),
      );
      await updatePassword(user, pwForm.newPw);
      toast.success("Password changed successfully");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      toast.error(
        err.code === "auth/wrong-password"
          ? "Current password is incorrect"
          : "Failed to change password",
      );
    } finally {
      setPwLoading(false);
    }
  };

  const roleLabel = {
    boys_admin: "Boys Admin",
    girls_admin: "Girls Admin",
    super_admin: "Super Admin",
  };
  const pwFields = [
    {
      label: "Current Password",
      key: "current",
      show: showCurrent,
      toggle: setShowCurrent,
    },
    { label: "New Password", key: "newPw", show: showNew, toggle: setShowNew },
    {
      label: "Confirm New Password",
      key: "confirm",
      show: showConfirm,
      toggle: setShowConfirm,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and portal settings"
      />

      {/* Two-column on lg+, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — Profile + System Info */}
        <div className="lg:col-span-1 space-y-5">
          {/* Profile card */}
          <div
            className="bg-white rounded-md p-5 sm:p-6"
            style={{ border: `1px solid ${T.border}` }}
          >
            <div
              className="flex items-center gap-2.5 mb-4 pb-4"
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              <User size={16} style={{ color: T.green }} />
              <h2 className="text-sm font-semibold" style={{ color: T.text }}>
                Profile
              </h2>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div
                className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold text-white"
                style={{ background: T.accent }}
              >
                {userProfile?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: T.text }}
                >
                  {userProfile?.name || "Admin"}
                </p>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: T.muted }}
                >
                  {userProfile?.email || auth.currentUser?.email}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: T.muted }}
                >
                  Role
                </p>
                <div
                  className="px-3 py-2 text-sm rounded"
                  style={{
                    background: T.bg,
                    color: T.text,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  {roleLabel[userProfile?.role] || "Admin"}
                </div>
              </div>
              <div>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: T.muted }}
                >
                  Portal
                </p>
                <div
                  className="px-3 py-2 text-sm rounded"
                  style={{
                    background: T.bg,
                    color: T.text,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  Boys Portal
                </div>
              </div>
              <div>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: T.muted }}
                >
                  Status
                </p>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full"
                  style={{ background: "#E8F5EE", color: T.green }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* System Info card */}
          <div
            className="bg-white rounded-md p-5 sm:p-6"
            style={{ border: `1px solid ${T.border}` }}
          >
            <div
              className="flex items-center gap-2.5 mb-4 pb-4"
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              <Info size={16} style={{ color: T.green }} />
              <h2 className="text-sm font-semibold" style={{ color: T.text }}>
                System Information
              </h2>
            </div>
            <div className="space-y-2">
              {[
                { label: "Portal", value: "Boys Portal" },
                { label: "System", value: "Student Administration System" },
                { label: "Version", value: "1.0.0" },
                { label: "Environment", value: "Production" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <span
                    className="text-xs uppercase tracking-wide"
                    style={{ color: T.muted }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: T.text }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Change Password */}
        <div className="lg:col-span-2">
          <div
            className="bg-white rounded-md p-5 sm:p-6"
            style={{ border: `1px solid ${T.border}` }}
          >
            <div
              className="flex items-center gap-2.5 mb-5 pb-4"
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              <Lock size={16} style={{ color: T.green }} />
              <h2 className="text-sm font-semibold" style={{ color: T.text }}>
                Change Password
              </h2>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="space-y-4 max-w-lg"
            >
              {pwFields.map(({ label, key, show, toggle }) => (
                <div key={key}>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: T.text }}
                  >
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      className="w-full h-9 border rounded px-3 pr-10 text-sm focus:outline-none focus:ring-1"
                      style={{ borderColor: T.border, color: T.text }}
                      value={pwForm[key]}
                      onChange={(e) =>
                        setPwForm({ ...pwForm, [key]: e.target.value })
                      }
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggle(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {show ? (
                        <EyeOff size={15} color={T.muted} />
                      ) : (
                        <Eye size={15} color={T.muted} />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t" style={{ borderColor: T.border }}>
                <p className="text-xs mb-4" style={{ color: T.muted }}>
                  Password must be at least 6 characters. You will be asked to
                  re-enter your current password for verification.
                </p>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-md"
                  style={{ background: T.green, opacity: pwLoading ? 0.7 : 1 }}
                >
                  {pwLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Updating…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
