
-- Drop all existing policies on orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Temporarily disable and re-enable RLS
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Recreate policies fresh
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Force schema reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
