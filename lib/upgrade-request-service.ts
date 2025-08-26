import { supabase } from './supabase'

export interface UpgradeRequest {
  id: string
  user_id: string
  user_email: string
  current_plan: string | null
  requested_plan: string
  message: string | null
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  admin_notes: string | null
  created_at: string
  updated_at: string
  processed_at: string | null
  processed_by: string | null
}

export interface CreateUpgradeRequestParams {
  requestedPlan: string
  message?: string
}

export class UpgradeRequestService {
  // Create a new upgrade request
  static async createUpgradeRequest(params: CreateUpgradeRequestParams): Promise<UpgradeRequest> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get current user data
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, plan_status')
        .eq('email', user.email)
        .single()

      if (!userData) {
        throw new Error('User data not found')
      }

      // Create the upgrade request
      const { data, error } = await supabase
        .from('upgrade_requests')
        .insert({
          user_id: userData.id,
          user_email: userData.email,
          current_plan: userData.plan_status,
          requested_plan: params.requestedPlan,
          message: params.message || null,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating upgrade request:', error)
        throw new Error('Failed to create upgrade request')
      }

      return data
    } catch (error) {
      console.error('Error in createUpgradeRequest:', error)
      throw error
    }
  }

  // Get user's upgrade requests
  static async getUserUpgradeRequests(): Promise<UpgradeRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('upgrade_requests')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching upgrade requests:', error)
        throw new Error('Failed to fetch upgrade requests')
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserUpgradeRequests:', error)
      throw error
    }
  }

  // Get pending upgrade requests (admin only)
  static async getPendingUpgradeRequests(): Promise<UpgradeRequest[]> {
    try {
      const { data, error } = await supabase
        .from('upgrade_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending upgrade requests:', error)
        throw new Error('Failed to fetch pending upgrade requests')
      }

      return data || []
    } catch (error) {
      console.error('Error in getPendingUpgradeRequests:', error)
      throw error
    }
  }

  // Update upgrade request status (admin only)
  static async updateUpgradeRequestStatus(
    requestId: string, 
    status: 'approved' | 'rejected' | 'completed',
    adminNotes?: string
  ): Promise<UpgradeRequest> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', user.email)
        .single()

      if (userData?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
      }

      const updateData: any = {
        status,
        processed_at: new Date().toISOString(),
        processed_by: userData.id
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes
      }

      const { data, error } = await supabase
        .from('upgrade_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single()

      if (error) {
        console.error('Error updating upgrade request:', error)
        throw new Error('Failed to update upgrade request')
      }

      return data
    } catch (error) {
      console.error('Error in updateUpgradeRequestStatus:', error)
      throw error
    }
  }

  // Get upgrade request by ID
  static async getUpgradeRequestById(requestId: string): Promise<UpgradeRequest | null> {
    try {
      const { data, error } = await supabase
        .from('upgrade_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        console.error('Error fetching upgrade request:', error)
        throw new Error('Failed to fetch upgrade request')
      }

      return data
    } catch (error) {
      console.error('Error in getUpgradeRequestById:', error)
      throw error
    }
  }

  // Get upgrade request statistics
  static async getUpgradeRequestStats() {
    try {
      const { data, error } = await supabase
        .from('upgrade_requests')
        .select('status')

      if (error) {
        console.error('Error fetching upgrade request stats:', error)
        throw new Error('Failed to fetch upgrade request stats')
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        approved: data?.filter(r => r.status === 'approved').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0,
        completed: data?.filter(r => r.status === 'completed').length || 0
      }

      return stats
    } catch (error) {
      console.error('Error in getUpgradeRequestStats:', error)
      throw error
    }
  }
}
