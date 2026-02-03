"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
} from "lucide-react";
import { formatCurrency, getProductImage } from "@/utils/helpers";
import { useCart } from "@/contexts/CartContext";
import { productService } from "@/services/productService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProduct(params.id);
      setProduct(response.data);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    await addToCart(product.id, quantity);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!product) return;

    setAddingToCart(true);
    await addToCart(product.id, quantity);
    setAddingToCart(false);
    router.push("/checkout");
  };

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(product?.stock || 1, value));
    setQuantity(newQuantity);
  };

  const images = [
    getProductImage(product?.image_url),
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ];

  const features = [
    { icon: Truck, text: "Free shipping on orders over ₹499" },
    { icon: RotateCcw, text: "30-day return policy" },
    { icon: Shield, text: "2-year warranty" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <p className="text-gray-600 mt-2">
          The product you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-transparent py-8">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-10 bg-white border border-gray-100 p-6 lg:p-10 shadow-sm">
          {/* Image gallery */}
          <div className="grid grid-cols-[120px_1fr] gap-4 max-h-[560px]">
            <div className="flex flex-col gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-full overflow-hidden bg-gray-100 aspect-[3/4] ${
                    selectedImage === index
                      ? "ring-2 ring-[rgba(255,63,108,0.6)]"
                      : "hover:shadow-sm"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="120px"
                    quality={85}
                  />
                </button>
              ))}
            </div>
            <div className="relative w-full bg-gray-100 overflow-hidden">
              <div className="aspect-[3/4] w-full">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={90}
                />
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            {/* Category */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-brand bg-brand-soft px-3 py-1 rounded-full uppercase tracking-wide">
                {product.category}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isWishlisted
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Share2 className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-4">
              {product.name}
            </h1>

            {/* SKU */}
            <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>

            {/* Rating */}
            <div className="flex items-center mt-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= 4
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                4.0 (128 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(product.price)}
              </p>
            </div>

            {/* Stock status */}
            <div className="mt-4">
              {product.stock > 0 ? (
                <p className="text-sm text-green-600 flex items-center">
                  <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                  In stock ({product.stock} available)
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center">
                  <span className="h-2 w-2 bg-red-600 rounded-full mr-2"></span>
                  Out of stock
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <div className="mt-4 text-gray-700 space-y-3">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <div className="flex items-center">
                <label className="mr-4 text-sm font-medium text-gray-900">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="w-16 text-center border-x border-gray-300 py-2"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-full font-medium ${
                  product.stock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-brand hover:bg-[#e11e5a] text-white"
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                disabled={product.stock === 0}
                onClick={handleBuyNow}
                className={`w-full px-6 py-3 rounded-full font-medium border ${
                  product.stock === 0
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-[rgba(255,63,108,0.6)] text-brand hover:bg-brand-soft"
                }`}
              >
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Features</h3>
              <div className="mt-4 space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center">
                      <div className="shrink-0">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <span className="ml-3 text-sm text-gray-600">
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Review Stats */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">4.0</div>
                <div className="flex justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mt-2">Based on 128 reviews</p>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="space-y-6">
              {[
                {
                  name: "Alex Johnson",
                  rating: 5,
                  date: "2 days ago",
                  comment: "Great product! Exceeded my expectations.",
                },
                {
                  name: "Maria Garcia",
                  rating: 4,
                  date: "1 week ago",
                  comment: "Good quality for the price. Would recommend.",
                },
              ].map((review, index) => (
                <div key={index} className="border-b pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{review.name}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="mt-3 text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

