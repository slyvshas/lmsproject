-- ============================================================================
-- Automatic User Profile Creation Trigger
-- ============================================================================
-- This trigger automatically creates a user profile in the public.users table
-- whenever a new user signs up via Supabase Auth
-- Run this AFTER running DATABASE_SCHEMA.sql and RLS_POLICIES.sql

-- ============================================================================
-- Function: Create user profile automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Trigger: Execute on auth.users insert
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Verification
-- ============================================================================

-- To test, create a new user via the signup form and check:
-- SELECT * FROM public.users WHERE email = 'your-test-email@example.com';

-- The user profile should appear automatically after signup!

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Now all authenticated users will automatically get a profile in the users table
-- No need to manually create profiles or wait for login
