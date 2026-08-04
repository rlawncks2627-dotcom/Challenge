// 자동 생성 파일 — 직접 수정하지 말 것.
// 스키마를 바꾼 뒤 Supabase 에서 타입을 다시 생성해 덮어쓴다.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          admin_code_hash: string
          created_at: string
          end_date: string
          goal_co2_g: number
          id: string
          invite_code: string
          name: string
          start_date: string
        }
        Insert: {
          admin_code_hash: string
          created_at?: string
          end_date: string
          goal_co2_g?: number
          id?: string
          invite_code: string
          name: string
          start_date: string
        }
        Update: {
          admin_code_hash?: string
          created_at?: string
          end_date?: string
          goal_co2_g?: number
          id?: string
          invite_code?: string
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          campaign_id: string
          co2_saved_g: number
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          points: number
          sort_order: number
          title: string
        }
        Insert: {
          campaign_id: string
          co2_saved_g?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          points?: number
          sort_order?: number
          title: string
        }
        Update: {
          campaign_id?: string
          co2_saved_g?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          points?: number
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_totals"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "challenges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          campaign_id: string
          challenge_id: string
          checkin_date: string
          co2_g: number
          created_at: string
          id: string
          memo: string | null
          participant_id: string
          photo_path: string | null
          points: number
        }
        Insert: {
          campaign_id: string
          challenge_id: string
          checkin_date: string
          co2_g?: number
          created_at?: string
          id?: string
          memo?: string | null
          participant_id: string
          photo_path?: string | null
          points?: number
        }
        Update: {
          campaign_id?: string
          challenge_id?: string
          checkin_date?: string
          co2_g?: number
          created_at?: string
          id?: string
          memo?: string | null
          participant_id?: string
          photo_path?: string | null
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "checkins_challenge_fk"
            columns: ["challenge_id", "campaign_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id", "campaign_id"]
          },
          {
            foreignKeyName: "checkins_participant_fk"
            columns: ["participant_id", "campaign_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["participant_id", "campaign_id"]
          },
          {
            foreignKeyName: "checkins_participant_fk"
            columns: ["participant_id", "campaign_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id", "campaign_id"]
          },
        ]
      }
      participants: {
        Row: {
          auth_user_id: string
          campaign_id: string
          created_at: string
          id: string
          nickname: string
        }
        Insert: {
          auth_user_id: string
          campaign_id: string
          created_at?: string
          id?: string
          nickname: string
        }
        Update: {
          auth_user_id?: string
          campaign_id?: string
          created_at?: string
          id?: string
          nickname?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_totals"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      campaign_totals: {
        Row: {
          campaign_id: string | null
          checkin_count: number | null
          participant_count: number | null
          total_co2_g: number | null
          total_points: number | null
        }
        Insert: {
          campaign_id?: string | null
          checkin_count?: never
          participant_count?: never
          total_co2_g?: never
          total_points?: never
        }
        Update: {
          campaign_id?: string | null
          checkin_count?: never
          participant_count?: never
          total_co2_g?: never
          total_points?: never
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          campaign_id: string | null
          checkin_count: number | null
          nickname: string | null
          participant_id: string | null
          rank: number | null
          total_co2_g: number | null
          total_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_totals"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      my_campaign_ids: { Args: never; Returns: string[] }
      my_participant_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
