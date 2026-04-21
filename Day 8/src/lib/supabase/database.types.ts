export type Database = {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string
          title: string
          owner_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          title: string
          owner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          owner_id?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          board_id: string
          title: string
          content: string
          kanban_column: string
          created_at: string
          due_date: string | null
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id: string
          board_id: string
          title: string
          content?: string
          kanban_column: string
          created_at: string
          due_date?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          title?: string
          content?: string
          kanban_column?: string
          created_at?: string
          due_date?: string | null
          completed_at?: string | null
          updated_at?: string
        }
      }
    }
  }
}
