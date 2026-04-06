import { useState, useEffect } from "react";
import { HiOutlineArrowRight, HiOutlineCheckBadge } from "react-icons/hi2";
import { supabase } from "../services/supabase";
import { TrackOrderSection } from "../components/TrackOrderSection";

export function LandingPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data }) => setProducts(data || []));
  }, []);

  return (
    <>
      <section className="relative w-full py-12 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 space-y-8 z-10">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
                New Summer Collection 2024
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                Elegance <span className="text-primary italic font-light">Redefined</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                Discover our exclusive collection of modern high-end abayas designed for the sophisticated woman who values tradition and contemporary style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="#collection" className="flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:scale-105 transition-transform">
                  Explore Collection
                  <HiOutlineArrowRight className="ml-2 w-5 h-5" />
                </a>
                <a href="#track" className="flex items-center justify-center px-8 py-4 border border-primary/30 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-primary/5 transition-colors">
                  Track Order
                </a>
              </div>
            </div>
            <div className="w-full lg:w-1/2 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-primary/20 bg-slate-200 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJxG8yRIQUfAJ_Yjq_uyG9doT1fmmSDj6G1gIS1JeYKBif1Dxtvmycns6eLXqdWAZObbVXaOj4Aj0YjxUf7wTR0QUNYcRHmbUltAinkmcW9KzKmZypnCSy6XrlxrX8vZBnsnb5HhdxAPcrexUYtBEVXC0wc1f0t0OkfQfnkCPOLN6pQHsm4w_UrP2I9L4X9CLmkCHP5nGzIy2qAGtg8srmoTOHhL9bxHI1zwVk4odGh0AE8vvXQtG7AJV3iCnvznfwWEHC7Qu2oqM')" }} />
              <div className="absolute -bottom-6 -left-6 bg-background-light dark:bg-background-dark p-6 rounded-2xl shadow-xl border border-primary/10 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <HiOutlineCheckBadge className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Premium Quality</p>
                    <p className="text-sm text-slate-500 ">100% Organic Silk</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="collection" className="py-24 bg-primary/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold dark:text-white mb-2">Featured Designs</h2>
              <p className="text-slate-500 max-w-md">Our signature pieces combine timeless silhouettes with modern artisanal details.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <div key={p.id} className="group flex flex-col gap-4">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: p.image_url ? `url('${p.image_url}')` : undefined }}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold dark:text-white">{p.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-primary/70">{p.description || p.category}</p>
                  <p className="text-lg font-bold text-primary mt-2">${Number(p.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrackOrderSection />
    </>
  );
}
