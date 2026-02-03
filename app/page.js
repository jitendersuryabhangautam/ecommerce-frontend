"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Star,
  Truck,
  Shield,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { productService } from "@/services/productService";
import { formatCurrency } from "@/utils/helpers";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 8 });
      setFeaturedProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const heroFeatures = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over ₹499",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "100% secure payment",
    },
    {
      icon: RefreshCw,
      title: "30-Day Returns",
      description: "Hassle-free returns",
    },
    {
      icon: CreditCard,
      title: "Easy Checkout",
      description: "Quick and easy",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/30 to-black/10" />
        <div className="relative px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white/70 mb-6">
              Welcome to{" "}
              <span className="text-[#ff2f60] drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
                ShopCart
              </span>
            </h1>
            <p className="text-xl text-white/65 max-w-3xl mx-auto mb-8">
              Discover amazing products at unbeatable prices. Shop the latest
              trends with free shipping on orders over ₹499.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-primary">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/products?category=sale" className="btn-outline">
                View Sale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {heroFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-brand-soft rounded-xl">
                    <Icon className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-600 mt-2">
              Our most popular products right now
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center text-brand hover:text-[rgb(var(--brand-primary-dark))] font-semibold"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <ProductGrid
          products={featuredProducts}
          loading={loading}
          emptyMessage="No featured products available"
          imageHeightClass="h-72"
        />
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              name: "Electronics",
              image:
                "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Clothing",
              image:
                "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Books",
              image:
                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Home",
              image:
                "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Sports",
              image:
                "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
            },
          ].map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${category.name.toLowerCase()}`}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div
                className="aspect-square bg-center bg-cover"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/60 transition" />
              <div className="absolute inset-0 flex items-end p-4">
                <span className="text-lg font-semibold text-white drop-shadow">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Johnson",
              role: "Verified Buyer",
              content:
                "Amazing products and fast delivery! The quality exceeded my expectations.",
              rating: 5,
            },
            {
              name: "Michael Chen",
              role: "Regular Customer",
              content:
                "Best prices I've found online. Customer service is excellent too!",
              rating: 5,
            },
            {
              name: "Emma Wilson",
              role: "First-time Buyer",
              content:
                "Easy checkout process and my order arrived earlier than expected.",
              rating: 4,
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="bg-linear-to-r from-[#ff3f6c] to-[#ff7a59] rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers. Sign up today and get 10% off
            your first order!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-outline">
              Sign Up Free
            </Link>
            <Link href="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
