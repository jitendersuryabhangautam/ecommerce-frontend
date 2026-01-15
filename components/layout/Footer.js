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
      description: "On orders over $50",
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
    <footer className="bg-gray-900 text-white">
      {/* Features */}
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold">ShopCart</span>
              </div>
              <p className="mt-4 text-gray-400 max-w-md">
                Your one-stop shop for all your needs. We offer high-quality
                products with fast delivery and excellent customer service.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Call us</p>
                  <p className="font-medium">+91 8587808287</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Email us</p>
                  <p className="font-medium">jitendergautam931@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-medium">
                    885, 14th Cross, Indiranagar, Bangalore, 560038, India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} ShopCart. All rights reserved.
            </p>
            <div className="mt-2 md:mt-0 flex space-x-6">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-white text-sm"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
