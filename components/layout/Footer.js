"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CreditCard,
  Truck,
  Shield,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Shop: [
      { name: "All Products", href: "/products" },
      { name: "New Arrivals", href: "/products?category=new" },
      { name: "Best Sellers", href: "/products?sort=popular" },
      { name: "Sale", href: "/products?on_sale=true" },
    ],
    Help: [
      { name: "FAQ", href: "/faq" },
      { name: "Shipping & Returns", href: "/shipping" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
  };

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over ₹499",
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "100% secure payment",
    },
    {
      icon: Shield,
      title: "Quality Products",
      description: "30-day return policy",
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Dedicated support",
    },
  ];

  return (
    <footer className="bg-[#12131a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold">ShopCart</span>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Curated styles and essentials with fast delivery.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-white/70">
            <Link href="/products" className="hover:text-white">
              Products
            </Link>
            <Link href="/orders" className="hover:text-white">
              Orders
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
          </div>

          <div className="flex space-x-3">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="h-9 w-9 rounded-full border border-white/10 text-white/70 flex items-center justify-center hover:text-white hover:border-white/30 transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {currentYear} ShopCart. All rights reserved.
      </div>
    </footer>
  );
}
