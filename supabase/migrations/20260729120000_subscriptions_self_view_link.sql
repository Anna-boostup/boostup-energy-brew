-- Admin/zákazník musí vidět a spravovat i vlastní předplatné založené jako host (user_id NULL, shoda e-mailu).

-- 1) RLS: povolit čtení řádků podle e-mailu z JWT (i když user_id ještě není napárováno)
DROP POLICY IF EXISTS subscriptions_select_email ON public.subscriptions;
CREATE POLICY subscriptions_select_email ON public.subscriptions
    FOR SELECT USING ( email IS NOT NULL AND lower(email) = lower(auth.jwt() ->> 'email') );

-- 2) Self-heal: přihlášený uživatel si napáruje svá hostovská předplatná podle e-mailu
CREATE OR REPLACE FUNCTION public.link_my_subscriptions()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE public.subscriptions s
    SET user_id = auth.uid(), updated_at = now()
    WHERE s.user_id IS NULL
      AND s.email IS NOT NULL
      AND lower(s.email) = lower(auth.jwt() ->> 'email');
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_my_subscriptions() TO authenticated;
