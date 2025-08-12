-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.board_positions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL,
  username text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT board_positions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_image text,
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  stripe_price_id text,
  variant_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  customer_email text NOT NULL,
  customer_name text,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'processing'::text, 'fulfilled'::text, 'cancelled'::text, 'failed'::text])),
  shipping_address jsonb,
  items jsonb NOT NULL,
  printful_order_id text,
  printful_order_status text,
  tapstitch_order_id text,
  tapstitch_order_status text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  graduation_year integer,
  major text,
  user_type USER-DEFINED NOT NULL DEFAULT 'undergrad'::user_type,
  board_position text,
  linkedin_url text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_admin boolean NOT NULL DEFAULT false,
  username text UNIQUE,
  instagram_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);