-- Napárování předplatného hosta na účet při vzniku profilu (shoda e-mailu)
CREATE OR REPLACE FUNCTION public.link_guest_subscriptions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE public.subscriptions s
    SET user_id = NEW.id, updated_at = now()
    WHERE s.user_id IS NULL
      AND s.email IS NOT NULL
      AND NEW.email IS NOT NULL
      AND lower(s.email) = lower(NEW.email);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_guest_subscriptions ON public.profiles;
CREATE TRIGGER trg_link_guest_subscriptions
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.link_guest_subscriptions();
