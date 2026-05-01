export interface UserProfile {
  email: string | null;
  role: 'admin' | 'customer';
  displayName: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  smsNotification: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
}

export interface SystemSettings {
  smsEnabled: boolean;
  bankAccountInfo: string;
  referralBonus: number;
  siteName: string;
  logoText: string;
  tagline: string;
  contactEmail: string;
  bkashNumber: string;
  nagadNumber: string;
  paypalEmail: string;
  // Homepage Dynamic Content
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  storyTitle: string;
  storySubtitle: string;
  storyContent: string;
  processTitle: string;
  processSubtitle: string;
  processContent: string;
}

export interface SMSLog {
  id: string;
  userId: string;
  phoneNumber: string;
  message: string;
  status: 'sent' | 'failed';
  createdAt: string;
}
