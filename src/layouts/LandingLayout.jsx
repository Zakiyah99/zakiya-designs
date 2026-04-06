import { Outlet, Link } from "react-router-dom";
import { HiSparkles } from "react-icons/hi2";
import logo from "../images/white_on_trans.png"
import { FaTiktok, FaInstagram, FaWhatsapp } from "react-icons/fa";


export function LandingLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-100 dark:text-slate-100 font-display transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="text-primary">
                < img src={logo} alt="logo" className="w-14 h-14 object-contain scale-150"  />
              </div>
            </Link>
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
            <div className="flex items-center gap-4">
              <a href="#collection" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20">
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-slate-50 dark:bg-background-dark border-t border-primary/10 py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

      <p className="text-sm text-slate-500">
        © 2025 <span className="font-semibold text-primary">ZAKIYA DESIGN</span>. All Rights Reserved.
      </p>

      <div className="flex items-center gap-5 text-lg">

        <a
          href="https://www.tiktok.com/@zakiya_design?_r=1&_t=ZS-95E9KRFjNT7"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-black dark:hover:text-white transition duration-300"
        >
          <FaTiktok />
        </a>

        <a
          href="https://www.instagram.com/zakiya_design_?igsh=OWlmaHEyb2M2amdx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-pink-500 transition duration-300"
        >
          <FaInstagram />
        </a>

        <a
          href="https://wa.me/252771871609"
          target="_blank"
          rel="noopener noreferrer"
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
