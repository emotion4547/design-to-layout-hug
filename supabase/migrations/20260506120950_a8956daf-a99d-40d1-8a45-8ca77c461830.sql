-- Restrict integration_logs INSERT to service role only (service_role bypasses RLS, so deny everyone else)
DROP POLICY IF EXISTS "Service role can insert logs" ON public.integration_logs;

CREATE POLICY "Only service role can insert logs"
ON public.integration_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (false);