-- Create collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create junction table for collection products
CREATE TABLE public.collection_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(collection_id, product_id)
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

-- RLS policies for collections
CREATE POLICY "Collections are viewable by everyone" 
ON public.collections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert collections" 
ON public.collections 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update collections" 
ON public.collections 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete collections" 
ON public.collections 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for collection_products
CREATE POLICY "Collection products are viewable by everyone" 
ON public.collection_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert collection products" 
ON public.collection_products 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update collection products" 
ON public.collection_products 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete collection products" 
ON public.collection_products 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();