"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  User,
  Home,
  LogOut,
  Settings,
  ChevronDown,
  Mic,
  PenTool,
  Search,
  Code2,
  FileText,
} from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isMobileResumeOpen, setIsMobileResumeOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email: string;
    name: string;
    photoURL?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/current-user");
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      getCurrentUser();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Force a hard refresh to clear all client-side state
        window.location.href = "/sign-in";
      } else {
        console.error("Logout failed:", data.message);
        // Still redirect even if server logout fails to clear client state
        window.location.href = "/sign-in";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: still redirect to clear client state
      window.location.href = "/sign-in";
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleResume = () => {
    setIsResumeOpen(!isResumeOpen);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-dropdown")) {
        setIsProfileOpen(false);
      }
      if (!target.closest(".resume-dropdown")) {
        setIsResumeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={38} height={32} />
            <h2 className="text-primary-100 font-bold text-xl">AI MockPrep</h2>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <div className="relative resume-dropdown">
              <button
                type="button"
                onClick={toggleResume}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isResumeOpen ? "text-white bg-gray-800 border border-gray-700" : "text-gray-300 hover:text-white hover:bg-gray-800/70 border border-transparent"}`}
              >
                <FileText className="w-4 h-4" />
                Resume
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isResumeOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isResumeOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-indigo-400/20 z-50 p-2">
                  <Link
                    href="/resume"
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-indigo-500/10 hover:text-white transition-colors border border-transparent hover:border-indigo-400/25"
                    onClick={() => setIsResumeOpen(false)}
                  >
                    <Search className="w-4 h-4 text-gray-400 group-hover:text-primary-100" />
                    <span className="text-sm font-medium">Resume Analyzer</span>
                  </Link>
                  <Link
                    href="/resume-builder"
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-indigo-500/10 hover:text-white transition-colors border border-transparent hover:border-indigo-400/25"
                    onClick={() => setIsResumeOpen(false)}
                  >
                    <PenTool className="w-4 h-4 text-gray-400 group-hover:text-primary-100" />
                    <span className="text-sm font-medium">Resume Builder</span>
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/speech-analytics"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Mic className="w-4 h-4" />
              Speech Coach
            </Link>

            {/* User Profile */}
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            ) : currentUser ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUser.name?.charAt(0)?.toUpperCase() ||
                      currentUser.email?.charAt(0)?.toUpperCase() ||
                      "U"
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                    {/* Profile Header */}
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg overflow-hidden">
                          {currentUser.photoURL ? (
                            <img
                              src={currentUser.photoURL}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            currentUser.name?.charAt(0)?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {currentUser.name || "User"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Menu */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <hr className="my-2 border-gray-700" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href="/sign-in"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {currentUser && (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {currentUser.name?.charAt(0)?.toUpperCase() ||
                  currentUser.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
            )}
            <button
              type="button"
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              title={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800/95 backdrop-blur-sm rounded-lg mt-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <button
                type="button"
                className={`flex items-center justify-between gap-2 w-full text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors ${isMobileResumeOpen ? "bg-gray-700/50 text-white" : ""}`}
                onClick={() => {
                  setIsMobileResumeOpen((prev) => !prev);
                }}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Resume
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isMobileResumeOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isMobileResumeOpen && (
                <div className="ml-5 mr-2 mt-1 space-y-1 rounded-lg border border-gray-700/70 bg-gray-900/55 p-2">
                  <Link
                    href="/resume"
                    className="group flex items-center gap-2 text-gray-300 hover:text-white px-2.5 py-2 rounded-md transition-colors hover:bg-indigo-500/10"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsMobileResumeOpen(false);
                    }}
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Resume Analyzer</span>
                  </Link>
                  <Link
                    href="/resume-builder"
                    className="group flex items-center gap-2 text-gray-300 hover:text-white px-2.5 py-2 rounded-md transition-colors hover:bg-indigo-500/10"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsMobileResumeOpen(false);
                    }}
                  >
                    <PenTool className="w-4 h-4" />
                    <span className="text-sm">Resume Builder</span>
                  </Link>
                </div>
              )}
              <Link
                href="/speech-analytics"
                className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Mic className="w-4 h-4" />
                Speech Coach
              </Link>
              <Link
                href="/coding-interview"
                className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Code2 className="w-4 h-4" />
                Coding Interview
              </Link>

              {currentUser ? (
                <>
                  <div className="px-3 py-3 text-sm border-t border-gray-700 mt-2 bg-gray-700/50 rounded-md mx-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          currentUser.name?.charAt(0)?.toUpperCase() ||
                          currentUser.email?.charAt(0)?.toUpperCase() ||
                          "U"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {currentUser.name || "User"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
