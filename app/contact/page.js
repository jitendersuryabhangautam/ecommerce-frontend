"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone, MessageCircle, Clock, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const subject = searchParams.get("subject");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: subject || "",
    message: "",
    orderId: orderId || "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orderId) {
      setFormData((prev) => ({
        ...prev,
        subject: subject || `Support for Order #${orderId}`,
        orderId,
        message: `Regarding Order #${orderId}:\n\n`,
      }));
    }
  }, [orderId, subject]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      // In a real app, you would call your API here
      // await contactService.sendMessage(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        orderId: "",
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Support
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Get in touch with our support team for
            assistance with orders, returns, or any other questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(255,63,108,0.6)] focus:border-[rgb(var(--brand-primary))]"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(255,63,108,0.6)] focus:border-[rgb(var(--brand-primary))]"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(255,63,108,0.6)] focus:border-[rgb(var(--brand-primary))]"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                {formData.orderId && (
                  <div className="p-4 bg-brand-soft rounded-lg">
                    <p className="text-sm text-[rgb(var(--brand-primary-dark))]">
                      This message is related to Order #{formData.orderId}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(255,63,108,0.6)] focus:border-[rgb(var(--brand-primary))]"
                    placeholder="Please describe your issue in detail..."
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="updates"
                    className="h-4 w-4 text-brand rounded focus:ring-[rgba(255,63,108,0.6)]"
                  />
                  <label
                    htmlFor="updates"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Send me updates about my support request
                  </label>
                </div>

                <Button
                  type="submit"
                  loading={submitting}
                  className="w-full md:w-auto"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Contact Methods
              </h3>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-brand-soft rounded-lg hover:bg-brand-soft transition-colors">
                  <Phone className="h-5 w-5 text-brand mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-brand-soft rounded-lg hover:bg-brand-soft transition-colors">
                  <Mail className="h-5 w-5 text-brand mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">
                      support@shopcart.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-brand-soft rounded-lg hover:bg-brand-soft transition-colors">
                  <MessageCircle className="h-5 w-5 text-brand mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Click the chat icon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-brand mr-3" />
                <h3 className="text-lg font-bold text-gray-900">
                  Business Hours
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 8:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">10:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">11:00 AM - 5:00 PM EST</span>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-5 w-5 text-brand mr-3" />
                <h3 className="text-lg font-bold text-gray-900">Quick Help</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/faq?category=orders")}
                  className="block w-full text-left text-brand hover:text-[rgb(var(--brand-primary-dark))] transition-colors"
                >
                  Order Status & Tracking
                </button>
                <button
                  onClick={() => router.push("/faq?category=returns")}
                  className="block w-full text-left text-brand hover:text-[rgb(var(--brand-primary-dark))] transition-colors"
                >
                  Returns & Refunds
                </button>
                <button
                  onClick={() => router.push("/faq?category=shipping")}
                  className="block w-full text-left text-brand hover:text-[rgb(var(--brand-primary-dark))] transition-colors"
                >
                  Shipping & Delivery
                </button>
                <button
                  onClick={() => router.push("/faq?category=payments")}
                  className="block w-full text-left text-brand hover:text-[rgb(var(--brand-primary-dark))] transition-colors"
                >
                  Payment Issues
                </button>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-bold text-green-800">Fast Response Time</p>
                  <p className="text-sm text-green-700 mt-1">
                    Average response time: 2 hours during business hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Guarantee */}
        <div className="mt-12 bg-gradient-to-r from-[#ff3f6c] to-[#ff7a59] rounded-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">24/7 Support Guarantee</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              We're committed to providing you with the best support experience.
              Our team is available around the clock to ensure your issues are
              resolved promptly and efficiently.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-white/70">Live Chat</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">2h</div>
                <div className="text-sm text-white/70">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-white/70">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


