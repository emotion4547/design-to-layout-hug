-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing categories from enum
INSERT INTO public.categories (slug, name, sort_order) VALUES
  ('aromatic', 'Ароматические', 1),
  ('new-year', 'Новогодние', 2),
  ('mono', 'Монобукеты', 3),
  ('author', 'Авторские', 4),
  ('edible', 'Съедобные', 5),
  ('wedding', 'Свадебные', 6),
  ('box', 'В коробке', 7),
  ('gifts', 'Подарки', 8),
  ('balloons', 'Шары', 9),
  ('vases', 'Вазы', 10),
  ('certificates', 'Сертификаты', 11),
  ('toys', 'Игрушки', 12);

-- Add category_id column to products (nullable for now)
ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Migrate existing products to use category_id
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category::text = c.slug;

-- Create index for better performance
CREATE INDEX idx_products_category_id ON public.products(category_id);