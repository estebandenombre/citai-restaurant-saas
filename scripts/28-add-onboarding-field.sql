-- Add onboarding completion field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Update existing users to have completed onboarding (so they don't see the tutorial again)
UPDATE users SET has_completed_onboarding = TRUE WHERE has_completed_onboarding IS NULL; 