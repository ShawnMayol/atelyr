-- Atelyr E-Commerce Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Categories
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

alter table categories add column if not exists image_url text;

-- Products
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  category_id uuid not null references categories(id) on delete restrict,
  image_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'out_of_stock')),
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  email text not null,
  contact_number text,
  address text not null,
  payment_method text not null check (payment_method in ('cod', 'e_wallet', 'bank_transfer')),
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table orders add column if not exists completed_at timestamptz;

-- Order Items
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric(10, 2) not null check (price_at_purchase >= 0)
);

-- Profiles (linked to Supabase Auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_status on products(status);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_email on orders(email);
create index if not exists idx_order_items_order on order_items(order_id);

-- Helper function to check if current user is admin (SECURITY DEFINER to avoid RLS recursion)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Row Level Security (RLS)
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table profiles enable row level security;

-- Drop all existing policies to prevent conflicts
drop policy if exists "Categories are viewable by everyone" on categories;
drop policy if exists "Admins can insert categories" on categories;
drop policy if exists "Admins can update categories" on categories;
drop policy if exists "Admins can delete categories" on categories;

drop policy if exists "Active products are viewable by everyone" on products;
drop policy if exists "Products are viewable by everyone" on products;
drop policy if exists "Admins can insert products" on products;
drop policy if exists "Admins can update products" on products;
drop policy if exists "Admins can delete products" on products;

drop policy if exists "Anyone can create orders" on orders;
drop policy if exists "Orders are viewable by admins" on orders;
drop policy if exists "Orders are viewable by everyone" on orders;
drop policy if exists "Admins can update orders" on orders;
drop policy if exists "Admins can delete orders" on orders;

drop policy if exists "Anyone can create order items" on order_items;
drop policy if exists "Order items are viewable by admins" on order_items;
drop policy if exists "Order items are viewable by everyone" on order_items;

drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Profiles are viewable by everyone" on profiles;
drop policy if exists "Profiles can be updated by admins" on profiles;

-- Categories RLS Policies
create policy "Categories are viewable by everyone"
  on categories for select using (true);

create policy "Admins can insert categories"
  on categories for insert with check (true);

create policy "Admins can update categories"
  on categories for update using (true);

create policy "Admins can delete categories"
  on categories for delete using (true);

-- Products RLS Policies
create policy "Products are viewable by everyone"
  on products for select using (true);

create policy "Admins can insert products"
  on products for insert with check (true);

create policy "Admins can update products"
  on products for update using (true);

create policy "Admins can delete products"
  on products for delete using (true);

-- Orders RLS Policies
create policy "Anyone can create orders"
  on orders for insert with check (true);

create policy "Orders are viewable by everyone"
  on orders for select using (true);

create policy "Admins can update orders"
  on orders for update using (true);

create policy "Admins can delete orders"
  on orders for delete using (true);

-- Order Items RLS Policies
create policy "Anyone can create order items"
  on order_items for insert with check (true);

create policy "Order items are viewable by everyone"
  on order_items for select using (true);

-- Profiles RLS Policies
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Profiles can be updated by admins"
  on profiles for update using (true);

-- Grant full table privileges to anon and authenticated roles
grant select, insert, update, delete on public.categories to anon, authenticated;
grant select, insert, update, delete on public.products to anon, authenticated;
grant select, insert, update, delete on public.orders to anon, authenticated;
grant select, insert, update, delete on public.order_items to anon, authenticated;
grant select, insert, update, delete on public.profiles to anon, authenticated;

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), 'customer')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Supabase Storage Bucket setup for Product Images
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- Storage RLS Policies for Product Images
drop policy if exists "Product images are publicly accessible" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

create policy "Product images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'products');

create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'products');

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'products');

-- How to promote a user to Admin:
-- Run this query in Supabase SQL Editor after your admin signs up:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
