-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('trial', 'monthly', 'yearly')),
  trial_days INTEGER DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  max_restaurants INTEGER DEFAULT 1,
  max_users INTEGER DEFAULT 5,
  max_orders_per_month INTEGER DEFAULT 1000,
  ai_chat_enabled BOOLEAN DEFAULT false,
  analytics_enabled BOOLEAN DEFAULT true,
  export_enabled BOOLEAN DEFAULT true,
  priority_support BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create restaurant subscriptions table (for multi-restaurant plans)
CREATE TABLE IF NOT EXISTS restaurant_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_subscription_id, restaurant_id)
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, display_name, description, price, billing_cycle, trial_days, features, max_restaurants, max_users, max_orders_per_month, ai_chat_enabled, analytics_enabled, export_enabled, priority_support) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440010',
    'free_trial',
    'Free Trial',
    '14-day free trial with full access to all features except AI Chat',
    0.00,
    'trial',
    14,
    '{"menu_management": true, "order_management": true, "analytics": true, "export": true, "ai_chat": false, "multi_restaurant": false}',
    1,
    5,
    1000,
    false,
    true,
    true,
    false
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'starter',
    'Starter',
    'Perfect for small restaurants getting started',
    29.99,
    'monthly',
    0,
    '{"menu_management": true, "order_management": true, "analytics": true, "export": true, "ai_chat": false, "multi_restaurant": false}',
    1,
    5,
    1000,
    false,
    true,
    true,
    false
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    'pro',
    'Pro',
    'Advanced features including AI Chat for growing restaurants',
    59.99,
    'monthly',
    0,
    '{"menu_management": true, "order_management": true, "analytics": true, "export": true, "ai_chat": true, "multi_restaurant": false}',
    1,
    10,
    5000,
    true,
    true,
    true,
    false
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    'multi',
    'Multi',
    'Multi-restaurant management with AI Chat and priority support',
    99.99,
    'monthly',
    0,
    '{"menu_management": true, "order_management": true, "analytics": true, "export": true, "ai_chat": true, "multi_restaurant": true}',
    5,
    25,
    15000,
    true,
    true,
    true,
    true
  )
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Create RLS policies for restaurant_subscriptions
CREATE POLICY "Users can view their restaurant subscriptions" ON restaurant_subscriptions
  FOR SELECT TO authenticated USING (
    user_subscription_id IN (
      SELECT id FROM user_subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their restaurant subscriptions" ON restaurant_subscriptions
  FOR ALL TO authenticated USING (
    user_subscription_id IN (
      SELECT id FROM user_subscriptions WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_user_subscription_id ON restaurant_subscriptions(user_subscription_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_restaurant_id ON restaurant_subscriptions(restaurant_id);
