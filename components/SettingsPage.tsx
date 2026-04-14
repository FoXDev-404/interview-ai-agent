"use client";

import {
  Bell,
  Shield,
  Eye,
  Palette,
  User,
  Save,
  Settings as SettingsIcon,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Profile states
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email: string;
    name: string;
  } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    setMounted(true);
    const savedEmailNotifications = localStorage.getItem("emailNotifications");
    const savedInterviewReminders = localStorage.getItem("interviewReminders");
    const savedMarketingEmails = localStorage.getItem("marketingEmails");
    const savedAutoSave = localStorage.getItem("autoSave");

    if (savedEmailNotifications !== null)
      setEmailNotifications(JSON.parse(savedEmailNotifications));
    if (savedInterviewReminders !== null)
      setInterviewReminders(JSON.parse(savedInterviewReminders));
    if (savedMarketingEmails !== null)
      setMarketingEmails(JSON.parse(savedMarketingEmails));
    if (savedAutoSave !== null) setAutoSave(JSON.parse(savedAutoSave));

    // Load current user
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/current-user");
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        setDisplayName(user.name);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter a valid name");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("No user logged in");
        return;
      }

      await updateProfile(user, {
        displayName: displayName.trim(),
      });

      // Update the current user state
      if (currentUser) {
        setCurrentUser({ ...currentUser, name: displayName.trim() });
      }

      toast.success(
        "Profile updated successfully! Please refresh the page to see changes.",
      );
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleToggle = (
    setter: (value: boolean) => void,
    currentValue: boolean,
    storageKey: string,
  ) => {
    const newValue = !currentValue;
    setter(newValue);
    localStorage.setItem(storageKey, JSON.stringify(newValue));
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please enter both current and new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      toast.error("Please sign in again before changing your password");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated successfully");
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };

      if (
        firebaseError.code === "auth/wrong-password" ||
        firebaseError.code === "auth/invalid-credential"
      ) {
        toast.error("Current password is incorrect");
      } else if (firebaseError.code === "auth/weak-password") {
        toast.error("New password is too weak");
      } else if (firebaseError.code === "auth/requires-recent-login") {
        toast.error("Please sign out and sign back in, then try again");
      } else {
        toast.error(firebaseError.message || "Failed to update password");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="relative mb-12 pb-2 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-72 w-72 rounded-full bg-primary-200/5 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200/20 bg-primary-200/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-200">
            <SettingsIcon className="h-3 w-3" />
            Settings
          </div>
          <h1 className="hero-gradient-text mb-3 text-4xl font-bold md:text-5xl">
            Your Preferences
          </h1>
          <p className="mx-auto max-w-md text-light-400">
            Customize your AI MockPrep experience to match your workflow.
          </p>
        </div>
      </div>

      {/* ── Layout ────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Sticky sidebar nav (desktop only) */}
        <aside className="hidden lg:block">
          <div className="interview-glass sticky top-8 p-4">
            <p className="section-label mb-3 px-3">Navigation</p>
            <nav className="space-y-0.5">
              {(
                [
                  {
                    id: "profile",
                    icon: User,
                    label: "Profile",
                    color: "text-emerald-400",
                  },
                  {
                    id: "notifications",
                    icon: Bell,
                    label: "Notifications",
                    color: "text-blue-400",
                  },
                  {
                    id: "security",
                    icon: Shield,
                    label: "Security",
                    color: "text-violet-400",
                  },
                  {
                    id: "appearance",
                    icon: Palette,
                    label: "Appearance",
                    color: "text-fuchsia-400",
                  },
                  {
                    id: "interviews",
                    icon: Eye,
                    label: "Interviews",
                    color: "text-amber-400",
                  },
                ] as const
              ).map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-light-400 transition-all hover:bg-white/5 hover:text-white"
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 border-t border-white/6 pt-4">
              <a
                href="#danger"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400/60 transition-all hover:bg-red-500/5 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Danger Zone
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="space-y-6">
          {/* ── Profile ─────────────────────── */}
          <section id="profile" className="interview-glass overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />
            <div className="p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="step-card-icon h-10 w-10 !bg-emerald-500/10 !border-emerald-500/20 !text-emerald-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Profile</h2>
                  <p className="text-xs text-light-400">
                    Manage your public identity
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="section-label mb-1.5 block">
                    Display Name
                  </label>
                  <p className="mb-3 text-xs text-light-400">
                    Shown in your profile and navigation bar
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your full name"
                      className="flex-1 rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-light-100 placeholder:text-light-400 focus:border-primary-200/40 focus:outline-none focus:ring-1 focus:ring-primary-200/20"
                    />
                    <button
                      onClick={handleProfileUpdate}
                      disabled={isUpdatingProfile || !displayName.trim()}
                      className="interview-primary-btn flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-40"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {isUpdatingProfile ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
                {currentUser && (
                  <div className="flex items-center gap-2 text-xs text-light-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {currentUser.email}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Notifications ───────────────── */}
          <section
            id="notifications"
            className="interview-glass overflow-hidden"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
            <div className="p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="step-card-icon h-10 w-10 !bg-blue-500/10 !border-blue-500/20 !text-blue-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Notifications
                  </h2>
                  <p className="text-xs text-light-400">
                    Control what reaches your inbox
                  </p>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {(
                  [
                    {
                      label: "Email Notifications",
                      desc: "Interview reminders and platform updates",
                      checked: emailNotifications,
                      key: "emailNotifications",
                      setter: setEmailNotifications,
                    },
                    {
                      label: "Interview Reminders",
                      desc: "Get notified before scheduled interviews",
                      checked: interviewReminders,
                      key: "interviewReminders",
                      setter: setInterviewReminders,
                    },
                    {
                      label: "Marketing Emails",
                      desc: "New features, tips and product announcements",
                      checked: marketingEmails,
                      key: "marketingEmails",
                      setter: setMarketingEmails,
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-light-100">
                        {item.label}
                      </p>
                      <p className="text-xs text-light-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.checked}
                        onChange={() =>
                          handleToggle(
                            item.setter as (v: boolean) => void,
                            item.checked,
                            item.key,
                          )
                        }
                        aria-label={item.label}
                        title={item.label}
                      />
                      <div className="h-6 w-11 rounded-full bg-white/10 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-200 peer-checked:after:translate-x-full peer-focus:outline-none" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Privacy & Security ──────────── */}
          <section id="security" className="interview-glass overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />
            <div className="p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="step-card-icon h-10 w-10 !bg-violet-500/10 !border-violet-500/20 !text-violet-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Privacy & Security
                  </h2>
                  <p className="text-xs text-light-400">
                    Keep your account safe
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="section-label mb-3 block">
                    Change Password
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-light-100 placeholder:text-light-400 focus:border-primary-200/40 focus:outline-none focus:ring-1 focus:ring-primary-200/20"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-light-100 placeholder:text-light-400 focus:border-primary-200/40 focus:outline-none focus:ring-1 focus:ring-primary-200/20"
                    />
                  </div>
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword}
                    className="mt-4 interview-primary-btn px-5 py-2.5 text-sm disabled:opacity-40"
                  >
                    {isUpdatingPassword ? "Updating…" : "Update Password"}
                  </button>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-5">
                  <div>
                    <p className="text-sm font-medium text-light-100">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-light-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/20">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Appearance ──────────────────── */}
          <section id="appearance" className="interview-glass overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-fuchsia-500/70 to-transparent" />
            <div className="p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="step-card-icon h-10 w-10 !bg-fuchsia-500/10 !border-fuchsia-500/20 !text-fuchsia-400">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Appearance</h2>
                  <p className="text-xs text-light-400">
                    Personalise how the app looks
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-light-100">
                      Dark Mode
                    </p>
                    <p className="text-xs text-light-400">
                      Use dark theme across the application
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={theme === "dark"}
                      onChange={handleThemeToggle}
                      aria-label="Dark mode"
                      title="Dark mode"
                    />
                    <div className="h-6 w-11 rounded-full bg-white/10 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-200 peer-checked:after:translate-x-full peer-focus:outline-none" />
                  </label>
                </div>
                <div className="border-t border-white/5 pt-5">
                  <label
                    htmlFor="settings-language"
                    className="section-label mb-3 block"
                  >
                    Language
                  </label>
                  <select
                    id="settings-language"
                    className="rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-light-100 focus:border-primary-200/40 focus:outline-none focus:ring-1 focus:ring-primary-200/20"
                  >
                    <option className="bg-dark-200">English</option>
                    <option className="bg-dark-200">Spanish</option>
                    <option className="bg-dark-200">French</option>
                    <option className="bg-dark-200">German</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* ── Interview Preferences ───────── */}
          <section id="interviews" className="interview-glass overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
            <div className="p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="step-card-icon h-10 w-10 !bg-amber-500/10 !border-amber-500/20 !text-amber-400">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Interview Preferences
                  </h2>
                  <p className="text-xs text-light-400">
                    Shape your practice sessions
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="settings-default-duration"
                      className="section-label mb-3 block"
                    >
                      Default Duration
                    </label>
                    <select
                      id="settings-default-duration"
                      className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-light-100 focus:border-primary-200/40 focus:outline-none focus:ring-1 focus:ring-primary-200/20"
                    >
                      <option className="bg-dark-200">15 minutes</option>
                      <option className="bg-dark-200">30 minutes</option>
                      <option className="bg-dark-200">45 minutes</option>
                      <option className="bg-dark-200">60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="settings-difficulty-level"
                      className="section-label mb-3 block"
                    >
                      Difficulty Level
                    </label>
                    <select
                      id="settings-difficulty-level"
                      className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-light-100 focus:border-primary-200/40 focus:outline-none focus:ring-1 focus:ring-primary-200/20"
                    >
                      <option className="bg-dark-200">Beginner</option>
                      <option className="bg-dark-200">Intermediate</option>
                      <option className="bg-dark-200">Advanced</option>
                      <option className="bg-dark-200">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-5">
                  <div>
                    <p className="text-sm font-medium text-light-100">
                      Auto-save Progress
                    </p>
                    <p className="text-xs text-light-400">
                      Automatically save your progress during interviews
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={autoSave}
                      onChange={() =>
                        handleToggle(setAutoSave, autoSave, "autoSave")
                      }
                      aria-label="Auto-save progress"
                      title="Auto-save progress"
                    />
                    <div className="h-6 w-11 rounded-full bg-white/10 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-200 peer-checked:after:translate-x-full peer-focus:outline-none" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* ── Danger Zone ─────────────────── */}
          <section
            id="danger"
            className="overflow-hidden rounded-2xl border border-red-500/15 bg-red-500/5"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            <div className="p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-red-400">
                    Danger Zone
                  </h2>
                  <p className="text-xs text-red-400/60">
                    Irreversible account actions
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-light-100">
                    Delete Account
                  </p>
                  <p className="text-xs text-light-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20">
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          {/* ── Footer actions ──────────────── */}
          <div className="flex justify-end gap-3 pb-4">
            <button className="rounded-xl border border-white/8 bg-white/5 px-6 py-2.5 text-sm font-medium text-light-400 transition-all hover:bg-white/8 hover:text-light-100">
              Cancel
            </button>
            <button className="interview-primary-btn px-6 py-2.5 text-sm">
              Save All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
