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
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          difficulty: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          difficulty?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          difficulty?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          runner_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          runner_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          runner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runners"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color_scheme: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color_scheme?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      phase_durations: {
        Row: {
          base_weeks: number
          build_weeks: number
          created_at: string
          experience_level: Database["public"]["Enums"]["experience_level_type"]
          id: string
          peak_weeks: number
          race_type: Database["public"]["Enums"]["race_type"]
          taper_weeks: number
          total_weeks: number
          updated_at: string
        }
        Insert: {
          base_weeks: number
          build_weeks: number
          created_at?: string
          experience_level: Database["public"]["Enums"]["experience_level_type"]
          id?: string
          peak_weeks: number
          race_type: Database["public"]["Enums"]["race_type"]
          taper_weeks: number
          total_weeks: number
          updated_at?: string
        }
        Update: {
          base_weeks?: number
          build_weeks?: number
          created_at?: string
          experience_level?: Database["public"]["Enums"]["experience_level_type"]
          id?: string
          peak_weeks?: number
          race_type?: Database["public"]["Enums"]["race_type"]
          taper_weeks?: number
          total_weeks?: number
          updated_at?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          article_id: string | null
          completed: boolean | null
          id: string
          last_read_at: string | null
          progress_percentage: number | null
          runner_id: string | null
        }
        Insert: {
          article_id?: string | null
          completed?: boolean | null
          id?: string
          last_read_at?: string | null
          progress_percentage?: number | null
          runner_id?: string | null
        }
        Update: {
          article_id?: string | null
          completed?: boolean | null
          id?: string
          last_read_at?: string | null
          progress_percentage?: number | null
          runner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "runners"
            referencedColumns: ["id"]
          },
        ]
      }
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
          fitness_score: number | null
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
          fitness_score?: number | null
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
          fitness_score?: number | null
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
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      training_plans: {
        Row: {
          created_at: string
          current_week: number | null
          description: string | null
          id: string
          name: string
          plan_data: Json | null
          race_type: Database["public"]["Enums"]["race_type"] | null
          recalibration_needed: boolean | null
          runner_id: string
          start_date: string | null
          status: string | null
          tier: Database["public"]["Enums"]["tier_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_week?: number | null
          description?: string | null
          id?: string
          name: string
          plan_data?: Json | null
          race_type?: Database["public"]["Enums"]["race_type"] | null
          recalibration_needed?: boolean | null
          runner_id: string
          start_date?: string | null
          status?: string | null
          tier?: Database["public"]["Enums"]["tier_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_week?: number | null
          description?: string | null
          id?: string
          name?: string
          plan_data?: Json | null
          race_type?: Database["public"]["Enums"]["race_type"] | null
          recalibration_needed?: boolean | null
          runner_id?: string
          start_date?: string | null
          status?: string | null
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
      weekly_schedule_templates: {
        Row: {
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week_type"]
          id: string
          phase: Database["public"]["Enums"]["phase_type"]
          training_days: number
          updated_at: string
          workout_priority: number
          workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Insert: {
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week_type"]
          id?: string
          phase: Database["public"]["Enums"]["phase_type"]
          training_days: number
          updated_at?: string
          workout_priority: number
          workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Update: {
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week_type"]
          id?: string
          phase?: Database["public"]["Enums"]["phase_type"]
          training_days?: number
          updated_at?: string
          workout_priority?: number
          workout_type?: Database["public"]["Enums"]["workout_type"]
        }
        Relationships: []
      }
      workout_intensity_rules: {
        Row: {
          created_at: string
          id: string
          is_hard: boolean
          updated_at: string
          workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_hard?: boolean
          updated_at?: string
          workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_hard?: boolean
          updated_at?: string
          workout_type?: Database["public"]["Enums"]["workout_type"]
        }
        Relationships: []
      }
      workout_structures: {
        Row: {
          created_at: string
          energy_system_focus: string | null
          experience_level: Database["public"]["Enums"]["experience_level_type"]
          id: string
          max_distance: number | null
          max_duration: number | null
          min_distance: number | null
          min_duration: number | null
          phase: Database["public"]["Enums"]["phase_type"]
          primary_intensity_zone: string | null
          race_distance: Database["public"]["Enums"]["race_type"] | null
          structure_json: Json
          updated_at: string
          weekly_volume_percent: number | null
          workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Insert: {
          created_at?: string
          energy_system_focus?: string | null
          experience_level: Database["public"]["Enums"]["experience_level_type"]
          id?: string
          max_distance?: number | null
          max_duration?: number | null
          min_distance?: number | null
          min_duration?: number | null
          phase: Database["public"]["Enums"]["phase_type"]
          primary_intensity_zone?: string | null
          race_distance?: Database["public"]["Enums"]["race_type"] | null
          structure_json: Json
          updated_at?: string
          weekly_volume_percent?: number | null
          workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Update: {
          created_at?: string
          energy_system_focus?: string | null
          experience_level?: Database["public"]["Enums"]["experience_level_type"]
          id?: string
          max_distance?: number | null
          max_duration?: number | null
          min_distance?: number | null
          min_duration?: number | null
          phase?: Database["public"]["Enums"]["phase_type"]
          primary_intensity_zone?: string | null
          race_distance?: Database["public"]["Enums"]["race_type"] | null
          structure_json?: Json
          updated_at?: string
          weekly_volume_percent?: number | null
          workout_type?: Database["public"]["Enums"]["workout_type"]
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          details_json: Json | null
          distance_target: number | null
          duration: number | null
          id: string
          intensity: Database["public"]["Enums"]["intensity_type"] | null
          notes: string | null
          pace_target: string | null
          phase: Database["public"]["Enums"]["phase_type"] | null
          plan_id: string
          status: Database["public"]["Enums"]["workout_status_type"] | null
          structure_id: string | null
          type: Database["public"]["Enums"]["workout_type"] | null
          updated_at: string
          week_number: number | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          details_json?: Json | null
          distance_target?: number | null
          duration?: number | null
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_type"] | null
          notes?: string | null
          pace_target?: string | null
          phase?: Database["public"]["Enums"]["phase_type"] | null
          plan_id: string
          status?: Database["public"]["Enums"]["workout_status_type"] | null
          structure_id?: string | null
          type?: Database["public"]["Enums"]["workout_type"] | null
          updated_at?: string
          week_number?: number | null
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          details_json?: Json | null
          distance_target?: number | null
          duration?: number | null
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_type"] | null
          notes?: string | null
          pace_target?: string | null
          phase?: Database["public"]["Enums"]["phase_type"] | null
          plan_id?: string
          status?: Database["public"]["Enums"]["workout_status_type"] | null
          structure_id?: string | null
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
          {
            foreignKeyName: "workouts_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "workout_structures"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_fitness_score: {
        Args:
          | {
              race_time_str: string
              race_distance: Database["public"]["Enums"]["race_type"]
            }
          | { race_time_str: string; race_distance: string }
        Returns: number
      }
      generate_training_plan: {
        Args:
          | { runner_uuid: string }
          | {
              runner_uuid: string
              race_type_param: Database["public"]["Enums"]["race_type"]
              experience_level_param: Database["public"]["Enums"]["experience_level_type"]
              fitness_score_param: number
              training_days_param: number
              race_date_param: string
              training_start_date_param: string
            }
          | {
              runner_uuid: string
              race_type_param: Database["public"]["Enums"]["race_type"]
              experience_level_param: Database["public"]["Enums"]["experience_level_type"]
              fitness_score_param: number
              training_days_param: number
              race_date_param: string
              training_start_date_param: string
              plan_name_param?: string
              plan_description_param?: string
            }
        Returns: string
      }
      get_current_training_week: {
        Args: { start_date: string }
        Returns: number
      }
      time_to_fraction_of_day: {
        Args: { time_str: string }
        Returns: number
      }
    }
    Enums: {
      day_of_week_type: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
      experience_level_type: "Novice" | "Recreational" | "Competitive" | "Elite"
      gender_type: "Male" | "Female" | "Other"
      intensity_type: "Low" | "Moderate" | "High"
      phase_type: "Base" | "Build" | "Peak" | "Taper"
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
      day_of_week_type: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      experience_level_type: ["Novice", "Recreational", "Competitive", "Elite"],
      gender_type: ["Male", "Female", "Other"],
      intensity_type: ["Low", "Moderate", "High"],
      phase_type: ["Base", "Build", "Peak", "Taper"],
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
