-- Add new fields to orders table for extended order form
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS sender_name text,
ADD COLUMN IF NOT EXISTS sender_phone text,
ADD COLUMN IF NOT EXISTS is_surprise boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recipient_name text,
ADD COLUMN IF NOT EXISTS recipient_phone text,
ADD COLUMN IF NOT EXISTS card_text text,
ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'delivery',
ADD COLUMN IF NOT EXISTS pickup_time text;