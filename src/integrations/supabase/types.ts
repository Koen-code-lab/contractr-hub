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
      capacity_posts: {
        Row: {
          available_from: string | null
          available_until: string | null
          capacity_type: string | null
          capacity_value: number | null
          company_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          region: string | null
          specialisation: string | null
          title: string
          updated_at: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          capacity_type?: string | null
          capacity_value?: number | null
          company_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          region?: string | null
          specialisation?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          capacity_type?: string | null
          capacity_value?: number | null
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          region?: string | null
          specialisation?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capacity_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          certifications: string[]
          city: string | null
          company_type: string | null
          country: string | null
          created_at: string
          description: string | null
          employees: number | null
          id: string
          logo_url: string | null
          name: string
          postal_code: string | null
          recent_projects: Json
          region: string | null
          type: string | null
          updated_at: string
          vat_number: string | null
          verified: boolean
        }
        Insert: {
          address?: string | null
          certifications?: string[]
          city?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          employees?: number | null
          id?: string
          logo_url?: string | null
          name: string
          postal_code?: string | null
          recent_projects?: Json
          region?: string | null
          type?: string | null
          updated_at?: string
          vat_number?: string | null
          verified?: boolean
        }
        Update: {
          address?: string | null
          certifications?: string[]
          city?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          employees?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          postal_code?: string | null
          recent_projects?: Json
          region?: string | null
          type?: string | null
          updated_at?: string
          vat_number?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      company_invitations: {
        Row: {
          accepted_at: string | null
          channel: string | null
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          invited_by: string
          invited_by_company_id: string | null
          role: string
          status: string
          target_company_id: string | null
          token: string
          type: string
        }
        Insert: {
          accepted_at?: string | null
          channel?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          invited_by: string
          invited_by_company_id?: string | null
          role?: string
          status?: string
          target_company_id?: string | null
          token?: string
          type?: string
        }
        Update: {
          accepted_at?: string | null
          channel?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          invited_by?: string
          invited_by_company_id?: string | null
          role?: string
          status?: string
          target_company_id?: string | null
          token?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          addressee_company_id: string | null
          addressee_id: string | null
          created_at: string
          id: string
          requester_company_id: string | null
          requester_id: string
          status: string
        }
        Insert: {
          addressee_company_id?: string | null
          addressee_id?: string | null
          created_at?: string
          id?: string
          requester_company_id?: string | null
          requester_id: string
          status?: string
        }
        Update: {
          addressee_company_id?: string | null
          addressee_id?: string | null
          created_at?: string
          id?: string
          requester_company_id?: string | null
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          participant_a: string
          participant_b: string | null
          project_id: string | null
          target_company_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_a: string
          participant_b?: string | null
          project_id?: string | null
          target_company_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_a?: string
          participant_b?: string | null
          project_id?: string | null
          target_company_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_attachments: {
        Row: {
          capacity_post_id: string | null
          created_at: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          project_id: string | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          capacity_post_id?: string | null
          created_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          project_id?: string | null
          storage_path: string
          uploaded_by: string
        }
        Update: {
          capacity_post_id?: string | null
          created_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_attachments_capacity_post_id_fkey"
            columns: ["capacity_post_id"]
            isOneToOne: false
            referencedRelation: "capacity_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          region: string | null
          role: string | null
          specialisations: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          region?: string | null
          role?: string | null
          specialisations?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          region?: string | null
          role?: string | null
          specialisations?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          project_id: string
          uploaded_at: string
          visibility: string
        }
        Insert: {
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          project_id: string
          uploaded_at?: string
          visibility?: string
        }
        Update: {
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string
          uploaded_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_interests: {
        Row: {
          created_at: string
          id: string
          interested_company_id: string | null
          interested_user_id: string
          message: string | null
          owner_company_id: string | null
          owner_user_id: string
          project_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          interested_company_id?: string | null
          interested_user_id: string
          message?: string | null
          owner_company_id?: string | null
          owner_user_id: string
          project_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          interested_company_id?: string | null
          interested_user_id?: string
          message?: string | null
          owner_company_id?: string | null
          owner_user_id?: string
          project_id?: string
          status?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category: string | null
          company_id: string | null
          created_at: string
          created_by: string
          deadline: string | null
          description: string | null
          id: string
          location: string | null
          region: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          urgency: string | null
          visibility: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          region?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          urgency?: string | null
          visibility?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          region?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          urgency?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          available_from: string | null
          budget: number | null
          company_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          hourly_rate: number | null
          id: string
          location: string | null
          owner_id: string
          region: string | null
          status: Database["public"]["Enums"]["publication_status"]
          tags: string[]
          title: string
          type: Database["public"]["Enums"]["publication_type"]
          updated_at: string
          views: number
        }
        Insert: {
          available_from?: string | null
          budget?: number | null
          company_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          owner_id: string
          region?: string | null
          status?: Database["public"]["Enums"]["publication_status"]
          tags?: string[]
          title: string
          type: Database["public"]["Enums"]["publication_type"]
          updated_at?: string
          views?: number
        }
        Update: {
          available_from?: string | null
          budget?: number | null
          company_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          owner_id?: string
          region?: string | null
          status?: Database["public"]["Enums"]["publication_status"]
          tags?: string[]
          title?: string
          type?: Database["public"]["Enums"]["publication_type"]
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "publications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_company_role: {
        Args: { _company_id: string; _roles: string[]; _user_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      publication_status: "actief" | "gesloten" | "verlopen" | "in_gesprek"
      publication_type: "opdracht" | "capaciteit"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      publication_status: ["actief", "gesloten", "verlopen", "in_gesprek"],
      publication_type: ["opdracht", "capaciteit"],
    },
  },
} as const
