export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    /** Required by @supabase/supabase-js so `public` satisfies GenericSchema */
    Views: Record<string, never>
    Functions: Record<string, never>
    Tables: {
      rq10_workspaces: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      rq10_user_stub: {
        Row: {
          id: string
          display_name: string
          email: string
        }
        Insert: {
          id: string
          display_name: string
          email: string
        }
        Update: {
          id?: string
          display_name?: string
          email?: string
        }
        Relationships: []
      }
      rq10_tasks: {
        Row: {
          id: string
          workspace_id: string
          title: string
          status: string
          assignee: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          status?: string
          assignee?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          status?: string
          assignee?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rq10_task_comments: {
        Row: {
          id: string
          task_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          body?: string
          created_at?: string
        }
        Relationships: []
      }
    }
  }
}
