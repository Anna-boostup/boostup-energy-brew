-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id integer PRIMARY KEY DEFAULT 1,
  active_ai_provider text NOT NULL DEFAULT 'openai',
  openai_key text,
  openai_key_encrypted bytea,
  gemini_key text,
  gemini_key_encrypted bytea,
  anthropic_key text,
  anthropic_key_encrypted bytea,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON system_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON system_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON system_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create trigger function for encryption
CREATE OR REPLACE FUNCTION encrypt_system_settings_keys()
RETURNS TRIGGER AS $$
DECLARE
    secret_key text;
BEGIN
    secret_key := current_setting('app.settings.db_secret', true);
    IF secret_key IS NULL OR secret_key = '' THEN
        secret_key := 'boostup_fallback_secret_key_123';
    END IF;

    -- Encrypt OpenAI Key
    IF NEW.openai_key IS NOT NULL AND NEW.openai_key <> '***' AND NEW.openai_key <> '' THEN
        NEW.openai_key_encrypted = pgp_sym_encrypt(NEW.openai_key, secret_key);
        NEW.openai_key = '***';
    ELSIF NEW.openai_key = '' THEN
        NEW.openai_key_encrypted = NULL;
    END IF;

    -- Encrypt Gemini Key
    IF NEW.gemini_key IS NOT NULL AND NEW.gemini_key <> '***' AND NEW.gemini_key <> '' THEN
        NEW.gemini_key_encrypted = pgp_sym_encrypt(NEW.gemini_key, secret_key);
        NEW.gemini_key = '***';
    ELSIF NEW.gemini_key = '' THEN
        NEW.gemini_key_encrypted = NULL;
    END IF;

    -- Encrypt Anthropic Key
    IF NEW.anthropic_key IS NOT NULL AND NEW.anthropic_key <> '***' AND NEW.anthropic_key <> '' THEN
        NEW.anthropic_key_encrypted = pgp_sym_encrypt(NEW.anthropic_key, secret_key);
        NEW.anthropic_key = '***';
    ELSIF NEW.anthropic_key = '' THEN
        NEW.anthropic_key_encrypted = NULL;
    END IF;

    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger
DROP TRIGGER IF EXISTS system_settings_encrypt_trigger ON system_settings;
CREATE TRIGGER system_settings_encrypt_trigger
    BEFORE INSERT OR UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION encrypt_system_settings_keys();

-- Insert default row if empty
INSERT INTO system_settings (id, active_ai_provider) VALUES (1, 'openai') ON CONFLICT (id) DO NOTHING;

-- Create secure RPC for Edge Functions
CREATE OR REPLACE FUNCTION get_decrypted_ai_settings()
RETURNS jsonb AS $$
DECLARE
    secret_key text;
    settings_row record;
    result jsonb;
BEGIN
    secret_key := current_setting('app.settings.db_secret', true);
    IF secret_key IS NULL OR secret_key = '' THEN
        secret_key := 'boostup_fallback_secret_key_123';
    END IF;

    SELECT * INTO settings_row FROM system_settings WHERE id = 1;
    IF NOT FOUND THEN
        RETURN '{}'::jsonb;
    END IF;

    result := jsonb_build_object(
        'active_ai_provider', settings_row.active_ai_provider,
        'openai_key', CASE WHEN settings_row.openai_key_encrypted IS NOT NULL THEN pgp_sym_decrypt(settings_row.openai_key_encrypted, secret_key) ELSE NULL END,
        'gemini_key', CASE WHEN settings_row.gemini_key_encrypted IS NOT NULL THEN pgp_sym_decrypt(settings_row.gemini_key_encrypted, secret_key) ELSE NULL END,
        'anthropic_key', CASE WHEN settings_row.anthropic_key_encrypted IS NOT NULL THEN pgp_sym_decrypt(settings_row.anthropic_key_encrypted, secret_key) ELSE NULL END
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure the RPC
REVOKE ALL ON FUNCTION get_decrypted_ai_settings() FROM PUBLIC;
REVOKE ALL ON FUNCTION get_decrypted_ai_settings() FROM authenticated;
REVOKE ALL ON FUNCTION get_decrypted_ai_settings() FROM anon;

-- Only service_role can execute
GRANT EXECUTE ON FUNCTION get_decrypted_ai_settings() TO service_role;
