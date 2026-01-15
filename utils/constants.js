export const APP_NAME = "E-Commerce Store";
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [ORDER_STATUS.PROCESSING]: "bg-blue-100 text-blue-800",
  [ORDER_STATUS.SHIPPED]: "bg-purple-100 text-purple-800",
  [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800",
  [ORDER_STATUS.COMPLETED]: "bg-green-100 text-green-800",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
  [ORDER_STATUS.REFUNDED]: "bg-gray-100 text-gray-800",
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.COMPLETED]: "Completed",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
  [ORDER_STATUS.REFUNDED]: "Refunded",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const RETURN_STATUS = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
};

export const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
  "Beauty",
  "Toys",
  "Food",
  "Other",
];

export const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash_on_delivery", label: "Cash on Delivery" },
];

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
  "Austria",
  "Ireland",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "India",
  "Brazil",
  "Mexico",
  "Argentina",
  "Chile",
  "Other",
];
