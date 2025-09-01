export interface UserProfile {
  id: string
  family_id: string
  email: string
  name: string
  role: 'admin' | 'member'
  avatar_color: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_seen_at: string | null
  families: {
    id: string
    name: string
  }
}