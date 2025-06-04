export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      runners: {
        Row: {
          age: number | null
          created_at: string
          cross_training_preferences: string[] | null
          email: string
          experience_level:
            | Database["public"]["Enums"]["experience_level_type"]
            | null
          first_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          height_cm: number | null
          id: string
          injury_history: string | null
          last_name: string | null
          last_updated: string | null
          preferred_unit: Database["public"]["Enums"]["unit_type"] | null
          race_date: string | null
          race_goal: Database["public"]["Enums"]["race_type"] | null
          recent_race_distance: Database["public"]["Enums"]["race_type"] | null
          recent_race_time: string | null
          training_days: number | null
          training_intensity_preference:
            | Database["public"]["Enums"]["intensity_type"]
            | null
          training_start_date: string | null
          updated_at: string
          vdot: number | null
          weekly_mileage: number | null
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          cross_training_preferences?: string[] | null
          email: string
          experience_level?:
            | Database["public"]["Enums"]["experience_level_type"]
            | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          height_cm?: number | null
          id?: string
          injury_history?: string | null
          last_name?: string | null
          last_updated?: string | null
          preferred_unit?: Database["public"]["Enums"]["unit_type"] | null
          race_date?: string | null
          race_goal?: Database["public"]["Enums"]["race_type"] | null
          recent_race_distance?: Database["public"]["Enums"]["race_type"] | null
          recent_race_time?: string | null
          training_days?: number | null
          training_intensity_preference?:
            | Database["public"]["Enums"]["intensity_type"]
            | null
          training_start_date?: string | null
          updated_at?: string
          vdot?: number | null
          weekly_mileage?: number | null
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          cross_training_preferences?: string[] | null
          email?: string
          experience_level?:
            | Database["public"]["Enums"]["experience_level_type"]
            | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          height_cm?: number | null
          id?: string
          injury_history?: string | null
          last_name?: string | null
          last_updated?: string | null
          preferred_unit?: Database["public"]["Enums"]["unit_type"] | null
          race_date?: string | null
          race_goal?: Database["public"]["Enums"]["race_type"] | null
          recent_race_distance?: Database["public"]["Enums"]["race_type"] | null
          recent_race_time?: string | null
          training_days?: number | null
          training_intensity_preference?:
            | Database["public"]["Enums"]["intensity_type"]
            | null
          training_start_date?: string | null
          updated_at?: string
          vdot?: number | null
          weekly_mileage?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          runner_id: string
          start_date: string | null
          tier: Database["public"]["Enums"]["tier_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          runner_id: string
          start_date?: string | null
          tier?: Database["public"]["Enums"]["tier_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          runner_id?: string
          start_date?: string | null
          tier?: Database["public"]["Enums"]["tier_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runners"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          created_at: string
          current_week: number | null
          id: string
          plan_data: Json | null
          race_type: Database["public"]["Enums"]["race_type"] | null
          recalibration_needed: boolean | null
          runner_id: string
          start_date: string | null
          tier: Database["public"]["Enums"]["tier_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_week?: number | null
          id?: string
          plan_data?: Json | null
          race_type?: Database["public"]["Enums"]["race_type"] | null
          recalibration_needed?: boolean | null
          runner_id: string
          start_date?: string | null
          tier?: Database["public"]["Enums"]["tier_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_week?: number | null
          id?: string
          plan_data?: Json | null
          race_type?: Database["public"]["Enums"]["race_type"] | null
          recalibration_needed?: boolean | null
          runner_id?: string
          start_date?: string | null
          tier?: Database["public"]["Enums"]["tier_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runners"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          distance_target: number | null
          duration: number | null
          id: string
          intensity: Database["public"]["Enums"]["intensity_type"] | null
          notes: string | null
          pace_target: string | null
          plan_id: string
          status: Database["public"]["Enums"]["workout_status_type"] | null
          type: Database["public"]["Enums"]["workout_type"] | null
          updated_at: string
          week_number: number | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          distance_target?: number | null
          duration?: number | null
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_type"] | null
          notes?: string | null
          pace_target?: string | null
          plan_id: string
          status?: Database["public"]["Enums"]["workout_status_type"] | null
          type?: Database["public"]["Enums"]["workout_type"] | null
          updated_at?: string
          week_number?: number | null
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          distance_target?: number | null
          duration?: number | null
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_type"] | null
          notes?: string | null
          pace_target?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["workout_status_type"] | null
          type?: Database["public"]["Enums"]["workout_type"] | null
          updated_at?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_training_plan: {
        Args: { runner_uuid: string }
        Returns: string
      }
      get_current_training_week: {
        Args: { start_date: string }
        Returns: number
      }
    }
    Enums: {
      experience_level_type: "Novice" | "Recreational" | "Competitive" | "Elite"
      gender_type: "Male" | "Female" | "Other"
      intensity_type: "Low" | "Moderate" | "High"
      race_type: "5K" | "10K" | "Half Marathon" | "Marathon"
      tier_type: "Free" | "Basic" | "Premium"
      unit_type: "km" | "mi"
      workout_status_type: "Pending" | "Completed" | "Skipped"
      workout_type:
        | "Easy"
        | "Long"
        | "Tempo"
        | "Interval"
        | "Hill"
        | "Cross-training"
        | "Recovery"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      experience_level_type: ["Novice", "Recreational", "Competitive", "Elite"],
      gender_type: ["Male", "Female", "Other"],
      intensity_type: ["Low", "Moderate", "High"],
      race_type: ["5K", "10K", "Half Marathon", "Marathon"],
      tier_type: ["Free", "Basic", "Premium"],
      unit_type: ["km", "mi"],
      workout_status_type: ["Pending", "Completed", "Skipped"],
      workout_type: [
        "Easy",
        "Long",
        "Tempo",
        "Interval",
        "Hill",
        "Cross-training",
        "Recovery",
      ],
    },
  },
} as const
