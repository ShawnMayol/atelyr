-- ATELYR Quiet Luxury E-Commerce Seed Data Script
-- Run this in Supabase SQL Editor after running schema.sql

-- Safe reset order
truncate table order_items cascade;
truncate table orders cascade;
truncate table products cascade;
truncate table categories cascade;

-- 1. Insert Categories with Cover Images (Quiet Luxury Brand Positioning)
insert into categories (id, name, image_url) values
  ('c1111111-1111-4111-8111-111111111111', 'High-End Apparel', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80'),
  ('c2222222-2222-4222-8222-222222222222', 'Luxury Footwear', 'https://images.unsplash.com/photo-1519226719127-9e805abb99b1?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
  ('c3333333-3333-4333-8333-333333333333', 'Fine Leather Goods', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'),
  ('c4444444-4444-4444-8444-444444444444', 'Understated Accessories', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop&q=80'),
  ('c5555555-5555-4555-8555-555555555555', 'Bespoke Fragrances & Jewelry', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80');

-- 2. Insert Products (12 Curated Luxury Items)
insert into products (id, name, description, price, stock, category_id, image_url, status) values
  -- High-End Apparel
  (
    '11111111-1111-4111-8111-111111111111',
    'Vicuña & Mongolian Cashmere Sweater',
    'Hand-knitted from rarest Vicuña wool and pure Mongolian cashmere. Unparalleled softness with a timeless relaxed silhouette.',
    2850.00,
    8,
    'c1111111-1111-4111-8111-111111111111',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
    'active'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Double-Breasted Italian Wool Overcoat',
    'Precision-tailored from 100% virgin Italian wool. Clean structural lines without visible branding for understated sophistication.',
    3200.00,
    5,
    'c1111111-1111-4111-8111-111111111111',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80',
    'active'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Pure Mulberry Silk Slip Dress',
    'Bias-cut 22 momme Mulberry silk dress offering a fluid drape and effortless elegance.',
    1450.00,
    0,
    'c1111111-1111-4111-8111-111111111111',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
    'out_of_stock'
  ),

  -- Luxury Footwear
  (
    '44444444-4444-4444-8444-444444444444',
    'Artisanal Suede Venetian Loafers',
    'Handcrafted in Tuscany from buttery calfskin suede with a flexible leather sole.',
    890.00,
    14,
    'c2222222-2222-4222-8222-222222222222',
    'https://images.unsplash.com/photo-1614252369475-531eda835eb1?w=800&auto=format&fit=crop&q=80',
    'active'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'Minimalist Nappa Leather Boots',
    'Sleek ankle boots featuring ultra-soft Nappa leather, hand-stitched seams, and a subtle block heel.',
    1250.00,
    10,
    'c2222222-2222-4222-8222-222222222222',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    'active'
  ),

  -- Fine Leather Goods
  (
    '66666666-6666-4666-8666-666666666666',
    'Structured Logo-Free Calfskin Tote',
    'Architectural tote crafted from full-grain French calfskin with a suede interior lining and no external logos.',
    2400.00,
    6,
    'c3333333-3333-4333-8333-333333333333',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    'active'
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'Woven Nappa Leather Crossbody',
    'Intricately hand-woven leather flap bag featuring brushed pale-gold hardware and adjustable shoulder strap.',
    1950.00,
    4,
    'c3333333-3333-4333-8333-333333333333',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
    'active'
  ),

  -- Understated Accessories
  (
    '88888888-8888-4888-8888-888888888888',
    'Hand-Rolled Raw Silk Scarf',
    'Abstract neutral-tone raw silk scarf with hand-rolled edges, crafted by master artisans in Lyon.',
    420.00,
    20,
    'c4444444-4444-4444-8444-444444444444',
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop&q=80',
    'active'
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'Cashmere & Silk Travel Wrap',
    'Featherweight woven wrap combining fine Mongolian cashmere and Mulberry silk.',
    650.00,
    12,
    'c4444444-4444-4444-8444-444444444444',
    'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80',
    'active'
  ),

  -- Bespoke Fragrances & Jewelry
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Sanctum Extrait de Parfum (100ml)',
    'Artisanal fragrance notes of rare Oud wood, smoked sandalwood, amber, and Florentine iris.',
    480.00,
    15,
    'c5555555-5555-4555-8555-555555555555',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    'active'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '18k Recycled Gold Minimalist Cuff',
    'Solid 18k yellow gold bangle with a brushed satin finish and discrete internal engraving.',
    1800.00,
    7,
    'c5555555-5555-4555-8555-555555555555',
    'https://images.unsplash.com/photo-1611591475777-233cd7342d8c?w=800&auto=format&fit=crop&q=80',
    'active'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'Baroque Freshwater Pearl Earrings',
    'Naturally shaped baroque pearls suspended from 18k gold handcrafted ear hooks.',
    750.00,
    0,
    'c5555555-5555-4555-8555-555555555555',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    'inactive'
  );

-- 3. Create Default Admin User via SQL
-- Creates auth user 'admin@atelyr.com' with password 'admin123456' and sets role = 'admin'
do $$
declare
  admin_email text := 'admin@atelyr.com';
  admin_password text := 'admin123456';
  admin_id uuid := 'a1111111-1111-4111-8111-111111111111';
begin
  if not exists (select 1 from auth.users where email = admin_email) then
    insert into auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role
    ) values (
      admin_id, '00000000-0000-0000-0000-000000000000', admin_email,
      extensions.crypt(admin_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'
    );
  end if;

  insert into public.profiles (id, email, role)
  values (
    (select id from auth.users where email = admin_email),
    admin_email,
    'admin'
  )
  on conflict (id) do update set role = 'admin';
end $$;
