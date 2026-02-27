-- Disable RLS on leads table to allow public dashboard access
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Disable RLS on funnel_settings table
ALTER TABLE funnel_settings DISABLE ROW LEVEL SECURITY;

-- Ensure permissions are granted to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON funnel_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON funnel_settings TO authenticated;