-- Create integration logs table
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_type TEXT NOT NULL, -- 'amocrm', 'telegram'
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL, -- 'success', 'error', 'skipped'
  message TEXT,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view integration logs"
ON public.integration_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Edge functions can insert logs (service role)
CREATE POLICY "Service role can insert logs"
ON public.integration_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_integration_logs_created_at ON public.integration_logs(created_at DESC);
CREATE INDEX idx_integration_logs_type ON public.integration_logs(integration_type);