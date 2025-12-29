-- Allow category_id to be nullable for global addons
ALTER TABLE public.category_addons 
ALTER COLUMN category_id DROP NOT NULL;

-- Add is_global flag
ALTER TABLE public.category_addons 
ADD COLUMN is_global BOOLEAN DEFAULT false;