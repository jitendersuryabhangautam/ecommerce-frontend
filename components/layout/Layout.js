"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const hideHeader = pathname === "/login" || pathname === "/register";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!hideHeader && <Header onMenuClick={() => setSidebarOpen(true)} />}

      {!hideHeader && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 py-8">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
