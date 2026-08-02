// Database types matching the Supabase schema

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export type PaymentMethod = 'cod' | 'e_wallet' | 'bank_transfer'

export type UserRole = 'customer' | 'admin'

// Table row types

export type Category = {
  id: string
  name: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category_id: string
  image_url: string | null
  status: ProductStatus
  created_at: string
  category?: { id?: string; name: string }
  categories?: { id?: string; name: string }
}

export type Order = {
  id: string
  customer_name: string
  email: string
  contact_number: string | null
  address: string
  payment_method: PaymentMethod
  total_amount: number
  status: OrderStatus
  notes: string | null
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
}

export type Profile = {
  id: string
  email: string
  role: UserRole
  created_at: string
}

// Insert types (omit server-generated fields)

export type CategoryInsert = Omit<Category, 'id' | 'created_at'>

export type ProductInsert = Omit<Product, 'id' | 'created_at'>

export type OrderInsert = Omit<Order, 'id' | 'created_at'>

export type OrderItemInsert = Omit<OrderItem, 'id'>

// Update types (partial, excluding id)

export type CategoryUpdate = Partial<Omit<Category, 'id' | 'created_at'>>

export type ProductUpdate = Partial<Omit<Product, 'id' | 'created_at'>>

export type OrderUpdate = Partial<Omit<Order, 'id' | 'created_at'>>

// Joined types for queries that include relations

export type ProductWithCategory = Product & {
  category: Category
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    product: Product
  })[]
}
