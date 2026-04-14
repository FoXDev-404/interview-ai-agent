import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer
      className="relative overflow-hidden mt-auto"
      style={{
        background:
          "linear-gradient(160deg, #0d0f18 0%, #111327 50%, #0d0f18 100%)",
      }}
    >
      {/* Glow effect — matches cta-bottom-glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(202, 197, 254, 0.1) 0%, transparent 70%)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo and Description */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image src="/logo.svg" alt="logo" width={38} height={32} />
              <h3 className="text-primary-100 font-bold text-xl">
                AI MockPrep
              </h3>
            </Link>
            <p className="text-light-100/60 leading-relaxed max-w-sm text-sm">
              Master your interviews with AI-powered mock sessions. Get
              personalized feedback and improve your performance with
              cutting-edge technology.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                title="Twitter"
                className="w-9 h-9 rounded-full border border-white/10 hover:border-primary-200/50 flex items-center justify-center text-light-100/50 hover:text-primary-200 transition-all duration-200"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/nikhil-pratap-singh-81614b255/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="w-9 h-9 rounded-full border border-white/10 hover:border-primary-200/50 flex items-center justify-center text-light-100/50 hover:text-primary-200 transition-all duration-200"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://github.com/localghost09"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="w-9 h-9 rounded-full border border-white/10 hover:border-primary-200/50 flex items-center justify-center text-light-100/50 hover:text-primary-200 transition-all duration-200"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="hero-gradient-text font-semibold mb-5 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-light-100/60 hover:text-primary-200 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/interview"
                  className="text-light-100/60 hover:text-primary-200 transition-colors text-sm"
                >
                  Start Interview
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="text-light-100/60 hover:text-primary-200 transition-colors text-sm"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="text-light-100/60 hover:text-primary-200 transition-colors text-sm"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-4">
            <h4 className="hero-gradient-text font-semibold mb-5 text-sm uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-light-100/60 hover:text-primary-200 transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-light-100/60 hover:text-primary-200 transition-colors text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-light-100/60 hover:text-primary-200 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-light-100/60 hover:text-primary-200 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-light-100/60 hover:text-primary-200 transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Divider + Copyright */}
        <div className="border-t border-white/5 mt-10 pt-6 text-center">
          <p className="text-light-100/40 text-sm">
            &copy; {new Date().getFullYear()} AI MockPrep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
