-- Create table for category addons
CREATE TABLE public.category_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.category_addons ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Category addons are viewable by everyone"
ON public.category_addons
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert category addons"
ON public.category_addons
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update category addons"
ON public.category_addons
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete category addons"
ON public.category_addons
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_category_addons_updated_at
BEFORE UPDATE ON public.category_addons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();