export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          category: string
          id: string
          is_public: boolean
          is_urgent: boolean
          published_at: string
          title: string
        }
        Insert: {
          body: string
          category?: string
          id?: string
          is_public?: boolean
          is_urgent?: boolean
          published_at?: string
          title: string
        }
        Update: {
          body?: string
          category?: string
          id?: string
          is_public?: boolean
          is_urgent?: boolean
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string
          actor_id: string | null
          category: string
          created_at: string
          details: Json
          id: string
          ip_address: string
          target_id: string | null
          target_label: string
          user_agent: string
        }
        Insert: {
          action: string
          actor_email?: string
          actor_id?: string | null
          category?: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string
          target_id?: string | null
          target_label?: string
          user_agent?: string
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          category?: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string
          target_id?: string | null
          target_label?: string
          user_agent?: string
        }
        Relationships: []
      }
      fee_invoices: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string
          id: string
          student_id: string
          term: number
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          due_date: string
          id?: string
          student_id: string
          term: number
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          student_id?: string
          term?: number
          year?: number
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          amount: number
          id: string
          method: string
          paid_at: string
          reference: string
          student_id: string
        }
        Insert: {
          amount: number
          id?: string
          method?: string
          paid_at?: string
          reference?: string
          student_id: string
        }
        Update: {
          amount?: number
          id?: string
          method?: string
          paid_at?: string
          reference?: string
          student_id?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          created_at: string
          grade: string
          id: string
          score: number
          student_id: string
          subject: string
          teacher_comment: string
          term: number
          year: number
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          score: number
          student_id: string
          subject: string
          teacher_comment?: string
          term: number
          year: number
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          score?: number
          student_id?: string
          subject?: string
          teacher_comment?: string
          term?: number
          year?: number
        }
        Relationships: []
      }
      parent_students: {
        Row: {
          created_at: string
          id: string
          parent_email: string
          parent_id: string
          parent_name: string
          relationship: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_email?: string
          parent_id: string
          parent_name?: string
          relationship?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_email?: string
          parent_id?: string
          parent_name?: string
          relationship?: string
          student_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admission_number: string | null
          class_name: string
          created_at: string
          full_name: string
          id: string
          stream: string
        }
        Insert: {
          admission_number?: string | null
          class_name?: string
          created_at?: string
          full_name?: string
          id: string
          stream?: string
        }
        Update: {
          admission_number?: string | null
          class_name?: string
          created_at?: string
          full_name?: string
          id?: string
          stream?: string
        }
        Relationships: []
      }
      timetable_entries: {
        Row: {
          class_name: string
          day_of_week: number
          end_time: string
          id: string
          room: string
          start_time: string
          subject: string
          teacher: string
        }
        Insert: {
          class_name: string
          day_of_week: number
          end_time: string
          id?: string
          room?: string
          start_time: string
          subject: string
          teacher?: string
        }
        Update: {
          class_name?: string
          day_of_week?: number
          end_time?: string
          id?: string
          room?: string
          start_time?: string
          subject?: string
          teacher?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_parent_of: {
        Args: { _parent_id: string; _student_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student" | "parent" | "dean"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "student", "parent", "dean"],
    },
  },
} as const
