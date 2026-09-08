export interface Product {
  id: number | string;
  slug: string;
  name: string;
  category: 'face' | 'hair' | 'soap' | string;
  subcategory?: string;
  family: string;
  price: number;
  tagline: string;
  overview: string;
  benefits: string[];
  how_to_use?: string[];
  caution?: string;
  concerns: string[];
  featured?: boolean;
  is_coming_soon?: boolean;
  image_url?: string;
}

export interface CartItem {
  id: number | string;
  qty: number;
}

export interface Concern {
  key: string;
  label: string;
}

export interface Category {
  key: string;
  label: string;
  description?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  created_at?: string;
}

export interface Order {
  id?: string;
  reference: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  province?: string;
  notes?: string;
  items: {
    product_id: number | string;
    product_name: string;
    price: number;
    qty: number;
  }[];
  subtotal: number;
  shipping_fee?: number;
  coupon_code?: string;
  discount_amount?: number;
  total: number;
  payment_method: 'bank' | 'jazzcash' | 'easypaisa' | 'cod' | string;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  order_number?: string;
  message: string;
  status?: 'unread' | 'read' | 'replied';
  created_at?: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export interface DbSubcategory {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface ShowcaseVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  product_id?: string | number;
  product_name?: string;
  product_slug?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
}

