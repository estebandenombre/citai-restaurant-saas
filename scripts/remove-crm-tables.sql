-- Remove CRM functionality from database
-- This script removes all CRM-related tables, functions, triggers, and views

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS campaign_performance;
DROP VIEW IF EXISTS customer_summary;

-- Drop triggers (they depend on functions)
DROP TRIGGER IF EXISTS trigger_calculate_customer_status ON customers;
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON orders;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_customer_status();
DROP FUNCTION IF EXISTS update_customer_stats();
DROP FUNCTION IF EXISTS track_customer_interaction(UUID, UUID, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS get_customer_analytics(UUID);

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS customer_preferences;
DROP TABLE IF EXISTS customer_interactions;
DROP TABLE IF EXISTS customer_segments;
DROP TABLE IF EXISTS email_campaigns;
DROP TABLE IF EXISTS customers;

-- Remove any remaining indexes (they should be dropped with the tables, but just in case)
-- Note: Indexes are automatically dropped when their tables are dropped

COMMENT ON TABLE customers IS 'CRM table - REMOVED';
COMMENT ON TABLE email_campaigns IS 'CRM table - REMOVED';
COMMENT ON TABLE customer_segments IS 'CRM table - REMOVED';
COMMENT ON TABLE customer_interactions IS 'CRM table - REMOVED';
COMMENT ON TABLE customer_preferences IS 'CRM table - REMOVED'; 