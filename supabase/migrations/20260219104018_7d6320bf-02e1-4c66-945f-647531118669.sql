
CREATE TABLE public.quiz_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  birthday TEXT,
  important_date TEXT,
  recipient_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz leads" ON public.quiz_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view quiz leads" ON public.quiz_leads FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete quiz leads" ON public.quiz_leads FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
