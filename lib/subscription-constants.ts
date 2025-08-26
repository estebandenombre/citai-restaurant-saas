// Subscription Plan IDs
export const SUBSCRIPTION_PLAN_IDS = {
  FREE_TRIAL: '550e8400-e29b-41d4-a716-446655440010',
  STARTER: '550e8400-e29b-41d4-a716-446655440011',
  PRO: '550e8400-e29b-41d4-a716-446655440012',
  MULTI: '550e8400-e29b-41d4-a716-446655440013'
} as const

// Subscription Plan Names
export const SUBSCRIPTION_PLAN_NAMES = {
  FREE_TRIAL: 'free_trial',
  STARTER: 'starter',
  PRO: 'pro',
  MULTI: 'multi'
} as const

// Helper function to get plan ID by name
export function getPlanIdByName(name: string): string | null {
  const planMap: Record<string, string> = {
    [SUBSCRIPTION_PLAN_NAMES.FREE_TRIAL]: SUBSCRIPTION_PLAN_IDS.FREE_TRIAL,
    [SUBSCRIPTION_PLAN_NAMES.STARTER]: SUBSCRIPTION_PLAN_IDS.STARTER,
    [SUBSCRIPTION_PLAN_NAMES.PRO]: SUBSCRIPTION_PLAN_IDS.PRO,
    [SUBSCRIPTION_PLAN_NAMES.MULTI]: SUBSCRIPTION_PLAN_IDS.MULTI
  }
  
  return planMap[name] || null
}

// Helper function to get plan name by ID
export function getPlanNameById(id: string): string | null {
  const planMap: Record<string, string> = {
    [SUBSCRIPTION_PLAN_IDS.FREE_TRIAL]: SUBSCRIPTION_PLAN_NAMES.FREE_TRIAL,
    [SUBSCRIPTION_PLAN_IDS.STARTER]: SUBSCRIPTION_PLAN_NAMES.STARTER,
    [SUBSCRIPTION_PLAN_IDS.PRO]: SUBSCRIPTION_PLAN_NAMES.PRO,
    [SUBSCRIPTION_PLAN_IDS.MULTI]: SUBSCRIPTION_PLAN_NAMES.MULTI
  }
  
  return planMap[id] || null
}
