
-- Create a trigger that assigns admin role to the next user who signs up
-- This trigger will auto-delete itself after first execution
CREATE OR REPLACE FUNCTION public.assign_admin_to_next_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  -- Self-destruct: remove trigger after first use
  DROP TRIGGER IF EXISTS on_next_signup_make_admin ON auth.users;
  DROP FUNCTION IF EXISTS public.assign_admin_to_next_signup();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_next_signup_make_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_to_next_signup();
