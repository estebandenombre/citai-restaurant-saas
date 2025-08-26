# Trial System Guide

This document provides a comprehensive guide for the simplified trial system without Stripe integration.

## 🚀 Overview

The trial system provides:
- **Automatic 14-day free trial** for all new users
- **Manual plan management** through database updates
- **Trial expiration handling** with user notifications
- **Contact-based upgrades** instead of automatic payments

## 📋 System Architecture

### Database Schema

The system uses the following columns in the `users` table:

- **`plan_id`**: References the subscription plan from `subscription_plans` table
- **`plan_status`**: Current status ('trial', 'active', 'canceled', 'trial_expired')
- **`trial_start`**: When the trial period began
- **`trial_end`**: When the trial period ends
- **`current_period_start`**: Start of current billing period
- **`current_period_end`**: End of current billing period

### Subscription Plans

Available plans in the `subscription_plans` table:

1. **Free Trial Plan** (`free-trial-plan`)
   - 14-day free trial
   - All features except AI Chat
   - Automatic assignment to new users

2. **Starter Plan** (`starter-plan`)
   - $29/month
   - Same features as Free Trial
   - Manual upgrade required

3. **Pro Plan** (`pro-plan`)
   - $79/month
   - Includes AI Chat Assistant
   - Manual upgrade required

4. **Multi Plan** (`multi-plan`)
   - $199/month
   - Multiple restaurants
   - Manual upgrade required

## 🔧 Setup Instructions

### 1. Database Setup

Run the cleanup script to remove Stripe and set up the trial system:

```sql
-- Execute in Supabase SQL Editor
scripts/102-remove-stripe-cleanup.sql
```

### 2. Verify Setup

Run the verification script to ensure everything is working:

```sql
-- Execute in Supabase SQL Editor
scripts/103-verify-trial-system.sql
```

### 3. Environment Variables

Update your `.env.local` file (remove Stripe variables):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔄 User Flow

### New User Registration

1. User creates account
2. Trigger automatically assigns 14-day trial
3. User gets access to all features except AI Chat
4. Trial period starts immediately

### During Trial

1. User can use all features except AI Chat
2. Dashboard shows trial status and days remaining
3. User can request upgrade through contact form

### Trial Expiration

1. After 14 days, trial expires
2. User sees trial expiration banner
3. User must contact support to upgrade
4. No automatic plan change

### Plan Upgrade

1. User clicks "Contact to Upgrade" on pricing page
2. Contact form opens with plan selection
3. User sends upgrade request
4. Admin manually updates user plan in database

## 🛠️ Manual Plan Management

### Upgrade User to Paid Plan

```sql
-- Upgrade to Pro Plan
UPDATE users 
SET 
    plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro-plan'),
    plan_status = 'active',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month'
WHERE email = 'user@example.com';
```

### Extend Trial Period

```sql
-- Extend trial by 7 days
UPDATE users 
SET trial_end = NOW() + INTERVAL '7 days'
WHERE email = 'user@example.com';
```

### Cancel Subscription

```sql
-- Cancel user subscription
UPDATE users 
SET plan_status = 'canceled'
WHERE email = 'user@example.com';
```

### Downgrade Plan

```sql
-- Downgrade to Starter Plan
UPDATE users 
SET 
    plan_id = (SELECT id FROM subscription_plans WHERE name = 'starter-plan'),
    plan_status = 'active',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month'
WHERE email = 'user@example.com';
```

## 📊 Monitoring

### Check User Status

```sql
-- View all users and their trial status
SELECT 
    u.email,
    u.plan_status,
    u.trial_start,
    u.trial_end,
    sp.display_name as plan_name,
    CASE 
        WHEN u.trial_end < NOW() AND u.plan_status = 'trial' THEN 'TRIAL_EXPIRED'
        WHEN u.trial_end >= NOW() AND u.plan_status = 'trial' THEN 'TRIAL_ACTIVE'
        WHEN u.plan_status = 'active' THEN 'PAID_PLAN'
        ELSE 'UNKNOWN'
    END as current_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;
```

### Trial Statistics

```sql
-- Get trial statistics
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN plan_status = 'trial' THEN 1 END) as trial_users,
    COUNT(CASE WHEN plan_status = 'trial' AND trial_end < NOW() THEN 1 END) as expired_trials,
    COUNT(CASE WHEN plan_status = 'trial' AND trial_end >= NOW() THEN 1 END) as active_trials,
    COUNT(CASE WHEN plan_status = 'active' THEN 1 END) as paid_users
FROM users;
```

## 🧪 Testing

### Test New User Registration

1. Create a new user account
2. Verify automatic trial assignment
3. Check trial_end is 14 days from creation
4. Verify trial status in dashboard

### Test Trial Expiration

1. Manually set trial_end to past date:
```sql
UPDATE users 
SET trial_end = NOW() - INTERVAL '1 day'
WHERE email = 'test@example.com';
```

2. Refresh dashboard
3. Verify trial expiration banner appears
4. Check that AI Chat is disabled

### Test Plan Upgrade

1. Use contact form on pricing page
2. Send upgrade request
3. Manually update user plan in database
4. Verify plan change in dashboard

## 🔧 Troubleshooting

### Common Issues

#### User Not Getting Trial

```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_assign_trial';

-- Manually assign trial
UPDATE users 
SET 
    plan_id = (SELECT id FROM subscription_plans WHERE name = 'free-trial-plan'),
    plan_status = 'trial',
    trial_start = NOW(),
    trial_end = NOW() + INTERVAL '14 days'
WHERE email = 'user@example.com' AND plan_id IS NULL;
```

#### Trial Not Expiring

```sql
-- Check trial expiration function
SELECT is_user_trial_expired(user_id) FROM users WHERE email = 'user@example.com';

-- Manually expire trial
UPDATE users 
SET trial_end = NOW() - INTERVAL '1 day'
WHERE email = 'user@example.com';
```

#### Plan Status Issues

```sql
-- Reset user plan status
UPDATE users 
SET 
    plan_status = 'trial',
    trial_start = NOW(),
    trial_end = NOW() + INTERVAL '14 days'
WHERE email = 'user@example.com';
```

## 📈 Best Practices

### Plan Management

1. **Always verify plan exists** before assigning
2. **Use transactions** for plan changes
3. **Log plan changes** for audit trail
4. **Notify users** of plan changes

### Trial Management

1. **Monitor expired trials** regularly
2. **Follow up** with expired trial users
3. **Offer trial extensions** when appropriate
4. **Track conversion rates**

### Database Maintenance

1. **Regular backups** of user data
2. **Monitor trial statistics** weekly
3. **Clean up old data** periodically
4. **Verify trigger functionality** monthly

## 🚀 Production Checklist

- [ ] Database cleanup script executed
- [ ] Trial system verified
- [ ] Environment variables updated
- [ ] Contact form tested
- [ ] Plan management procedures documented
- [ ] Monitoring queries set up
- [ ] Backup procedures in place
- [ ] Support team trained on manual upgrades

## 📞 Support

For issues related to:
- **Trial System**: Check this documentation
- **Plan Management**: Use provided SQL examples
- **User Issues**: Check database queries above
- **Technical Problems**: Review troubleshooting section

---

**Note**: This system is designed for manual management and provides full control over user plans without automatic payment processing.
