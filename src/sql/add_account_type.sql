-- Add account_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'personal' CHECK (account_type IN ('personal', 'company'));

-- Optional: Update existing profiles to 'personal' if null (though default handles new ones)
UPDATE public.profiles SET account_type = 'personal' WHERE account_type IS NULL;

-- If you have a trigger that creates profiles from auth.users, you might need to update it 
-- to copy raw_user_meta_data->>'account_type' to this column.
-- Example of such a trigger function update:
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, account_type)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'account_type', 'personal')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
