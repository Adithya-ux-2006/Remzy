-- Normalize profile fields for email/password and OAuth identities.
-- Google provides full_name/avatar_url, while existing registration uses name/avatar.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, university_email, university_name, current_year, gender)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'User'
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'university_email', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'university_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'current_year', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'gender', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
