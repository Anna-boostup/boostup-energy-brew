ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS trigger TEXT;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS placeholders TEXT[];

