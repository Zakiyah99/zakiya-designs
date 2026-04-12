import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { FaTiktok, FaInstagram, FaWhatsapp } from "react-icons/fa";
import logo from "../images/white_on_trans.png";

export function LandingLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-100 font-display transition-colors duration-300">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logo}
                alt="logo"
                className="w-16 h-16 object-contain"
              />
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-10">
              <Link to="/" className="text-sm font-semibold hover:text-primary transition-colors">
                Home
              </Link>
              <a href="#collection" className="text-sm font-semibold hover:text-primary transition-colors">
                Collection
              </a>
              <a href="#track" className="text-sm font-semibold hover:text-primary transition-colors">
                Track Order
              </a>
              <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors">
                Admin
              </Link>
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">
              
              {/* Desktop Button */}
              <a
                href="#collection"
                className="hidden md:inline-block bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
              >
                Shop Now
              </a>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-2xl text-primary"
              >
                {isOpen ? <HiX /> : <HiMenu />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white dark:bg-background-dark border-t border-primary/10 px-6 py-4 space-y-4">
            
            <Link to="/" onClick={() => setIsOpen(false)} className="block font-semibold text-black">
              Home
            </Link>

            <a href="#collection" onClick={() => setIsOpen(false)} className="block font-semibold text-black">
              Collection
            </a>

            <a href="#track" onClick={() => setIsOpen(false)} className="block font-semibold text-black">
              Track Order
            </a>

            <Link to="/login" onClick={() => setIsOpen(false)} className="block font-semibold text-black">
              Admin
            </Link>

            <a
              href="#collection"
              onClick={() => setIsOpen(false)}
              className="block bg-primary text-white text-center py-2 rounded-lg font-bold"
            >
              Shop Now
            </a>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-50 dark:bg-background-dark border-t border-primary/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

            {/* BRAND */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2025 <span className="font-semibold text-primary">ZAKIYA DESIGN</span>. All Rights Reserved.
            </p>

            {/* SOCIAL */}
            <div className="flex items-center gap-5 text-lg">

              <a
                href="https://www.tiktok.com/@zakiya_design"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-slate-500 hover:text-black dark:hover:text-white transition duration-300"
              >
                <FaTiktok />
              </a>

              <a
                href="https://www.instagram.com/zakiya_design_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-slate-500 hover:text-pink-500 transition duration-300"
              >
                <FaInstagram />
              </a>

              <a
                href="https://wa.me/252771871609"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-slate-500 hover:text-green-500 transition duration-300"
              >
                <FaWhatsapp />
              </a>

            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}