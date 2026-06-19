-- Povolení rozšíření pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tajný klíč pro šifrování se nastaví dynamicky v rámci funkce (níže)

-- Vytvoření funkce pro trigger, která heslo zašifruje při INSERTu a UPDATEu
CREATE OR REPLACE FUNCTION encrypt_mailbox_password()
RETURNS TRIGGER AS $$
DECLARE
    secret_key text;
BEGIN
    secret_key := current_setting('app.settings.mailbox_key', true);
    IF secret_key IS NULL OR secret_key = '' THEN
        secret_key := 'boostup_fallback_secret_key_123';
    END IF;

    -- IMAP heslo
    IF NEW.imap_password IS NOT NULL 
       AND NEW.imap_password != '' 
       AND NEW.imap_password != '********'
       AND (OLD.imap_password IS NULL OR NEW.imap_password != OLD.imap_password) THEN
        NEW.imap_password := encode(encrypt(NEW.imap_password::bytea, secret_key, 'aes'), 'hex');
    ELSIF NEW.imap_password = '********' THEN
        NEW.imap_password := OLD.imap_password;
    END IF;

    -- SMTP heslo
    IF NEW.smtp_password IS NOT NULL 
       AND NEW.smtp_password != '' 
       AND NEW.smtp_password != '********'
       AND (OLD.smtp_password IS NULL OR NEW.smtp_password != OLD.smtp_password) THEN
        NEW.smtp_password := encode(encrypt(NEW.smtp_password::bytea, secret_key, 'aes'), 'hex');
    ELSIF NEW.smtp_password = '********' THEN
        NEW.smtp_password := OLD.smtp_password;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Navázání triggeru na tabulku
DROP TRIGGER IF EXISTS encrypt_mailbox_password_trigger ON public.mailboxes;
CREATE TRIGGER encrypt_mailbox_password_trigger
    BEFORE INSERT OR UPDATE ON public.mailboxes
    FOR EACH ROW
    EXECUTE FUNCTION encrypt_mailbox_password();

-- Bezpečná RPC funkce pro Edge Function k rozšifrování (vrací pouze aktivní schránky)
CREATE OR REPLACE FUNCTION get_decrypted_mailboxes()
RETURNS TABLE (
    id uuid,
    email_address text,
    imap_host text,
    imap_port integer,
    imap_user text,
    imap_password text,
    smtp_host text,
    smtp_port integer,
    smtp_user text,
    smtp_password text,
    is_active boolean
) AS $$
DECLARE
    secret_key text;
BEGIN
    secret_key := current_setting('app.settings.mailbox_key', true);
    IF secret_key IS NULL OR secret_key = '' THEN
        secret_key := 'boostup_fallback_secret_key_123';
    END IF;

    RETURN QUERY 
    SELECT 
        m.id,
        m.email_address,
        m.imap_host,
        m.imap_port,
        m.imap_user,
        convert_from(decrypt(decode(m.imap_password, 'hex'), secret_key, 'aes'), 'utf8') AS imap_password,
        m.smtp_host,
        m.smtp_port,
        m.smtp_user,
        convert_from(decrypt(decode(m.smtp_password, 'hex'), secret_key, 'aes'), 'utf8') AS smtp_password,
        m.is_active
    FROM public.mailboxes m
    WHERE m.is_active = true AND m.imap_password IS NOT NULL AND m.imap_password != '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Odebrat přístup k této dešifrovací funkci všem kromě backendu
REVOKE ALL ON FUNCTION get_decrypted_mailboxes() FROM PUBLIC;
REVOKE ALL ON FUNCTION get_decrypted_mailboxes() FROM authenticated;
REVOKE ALL ON FUNCTION get_decrypted_mailboxes() FROM anon;
GRANT EXECUTE ON FUNCTION get_decrypted_mailboxes() TO service_role;
