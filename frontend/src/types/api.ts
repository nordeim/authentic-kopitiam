// Enums
export type ProductStatus = 'active' | 'inactive';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'paynow' | 'card' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ConsentType = 'marketing' | 'analytics' | 'third_party';
export type ConsentStatus = 'granted' | 'withdrawn' | 'expired';

// Core Models
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number; // DECIMAL(10,4) as number
  category_id: string | null;
  is_active: boolean;
  image_url: string | null;
  calories: number | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category?: Category;
  locations?: LocationProduct[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LocationProduct {
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  location_id: string;
  pickup_at: string;
  status: OrderStatus;
  subtotal_cents: number;
  gst_cents: number;
  total_cents: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  subtotal: number; // Calculated from subtotal_cents / 100
  gst: number; // Calculated from gst_cents / 100
  total: number; // Calculated from total_cents / 100
  location?: Location;
  items?: OrderItem[];
  payment?: Payment;
  user?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  unit_price_cents: number;
  quantity: number;
  unit_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  subtotal_cents: number; // Calculated: unit_price_cents × quantity
  product?: Product;
}

export interface Location {
  id: string;
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  email: string | null;
  operating_hours: OperatingHours;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  distance_km?: number; // Calculated field
  products?: Product[];
}

export interface OperatingHours {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
}

export interface DayHours {
  open: string; // HH:MM
  close: string; // HH:MM
  is_closed: boolean;
}

export interface PdpaConsent {
  id: string;
  customer_id: string | null;
  pseudonymized_id: string;
  consent_type: ConsentType;
  consent_status: ConsentStatus;
  consented_at: string;
  withdrawn_at: string | null;
  expires_at: string | null;
  ip_address: string;
  user_agent: string | null;
  consent_wording_hash: string;
  consent_version: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer?: User;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  transaction_id: string | null;
  status: PaymentStatus;
  paynow_qr_code: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  order?: Order;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Request Payload Types
export interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  location_id: string;
  pickup_at: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_name?: string;
    notes?: string;
  }>;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  is_active?: boolean;
  image_url?: string;
  calories?: number;
  stock_quantity?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category_id?: string;
  is_active?: boolean;
  image_url?: string;
  calories?: number;
  stock_quantity?: number;
}

export interface CreateLocationRequest {
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email?: string;
  operating_hours: OperatingHours;
  features: string[];
  is_active?: boolean;
}

export interface UpdateLocationRequest {
  name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  operating_hours?: OperatingHours;
  features?: string[];
  is_active?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}

// Utility Types
export type ProductFilter = 'All' | 'Coffee' | 'Breakfast' | 'Pastries' | 'Sides';
export type OrderStatusFilter = 'All' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// API Client Types
export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface ApiQueryParams {
  page?: number;
  per_page?: number;
  category_id?: string;
  is_active?: boolean;
  search?: string;
  status?: string;
  location_id?: string;
  customer_email?: string;
  lat?: number;
  lon?: number;
  max_distance_km?: number;
  features?: string[];
}

export interface CreateConsentRequest {
  consent_type: ConsentType;
  consent_version: string;
  consent_wording_hash: string;
}
