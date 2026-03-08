export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cities: {
        Row: {
          best_season: Database["public"]["Enums"]["season_type"] | null
          cafe_count: number | null
          created_at: string | null
          dislikes: number | null
          environment: Database["public"]["Enums"]["environment_type"][] | null
          id: string
          image_url: string | null
          internet_speed: number | null
          is_hidden: boolean
          ktx_time: number | null
          latitude: number | null
          likes: number | null
          longitude: number | null
          monthly_budget: number | null
          name: string
          name_en: string | null
          overall_score: number | null
          province: string
          rank: number | null
          region: Database["public"]["Enums"]["region_type"]
          rent_studio: number | null
          review_count: number | null
          tags: string[] | null
          updated_at: string | null
          weather_station_id: number | null
        }
        Insert: {
          best_season?: Database["public"]["Enums"]["season_type"] | null
          cafe_count?: number | null
          created_at?: string | null
          dislikes?: number | null
          environment?: Database["public"]["Enums"]["environment_type"][] | null
          id?: string
          image_url?: string | null
          internet_speed?: number | null
          is_hidden?: boolean
          ktx_time?: number | null
          latitude?: number | null
          likes?: number | null
          longitude?: number | null
          monthly_budget?: number | null
          name: string
          name_en?: string | null
          overall_score?: number | null
          province: string
          rank?: number | null
          region: Database["public"]["Enums"]["region_type"]
          rent_studio?: number | null
          review_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          weather_station_id?: number | null
        }
        Update: {
          best_season?: Database["public"]["Enums"]["season_type"] | null
          cafe_count?: number | null
          created_at?: string | null
          dislikes?: number | null
          environment?: Database["public"]["Enums"]["environment_type"][] | null
          id?: string
          image_url?: string | null
          internet_speed?: number | null
          is_hidden?: boolean
          ktx_time?: number | null
          latitude?: number | null
          likes?: number | null
          longitude?: number | null
          monthly_budget?: number | null
          name?: string
          name_en?: string | null
          overall_score?: number | null
          province?: string
          rank?: number | null
          region?: Database["public"]["Enums"]["region_type"]
          rent_studio?: number | null
          review_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          weather_station_id?: number | null
        }
        Relationships: []
      }
      city_metrics: {
        Row: {
          city_id: string
          created_at: string | null
          current_weather: Json
          data_source: string | null
          id: string
          internet_speed: number | null
          monthly_budget: number | null
          rent_studio: number | null
          updated_at: string | null
        }
        Insert: {
          city_id: string
          created_at?: string | null
          current_weather: Json
          data_source?: string | null
          id?: string
          internet_speed?: number | null
          monthly_budget?: number | null
          rent_studio?: number | null
          updated_at?: string | null
        }
        Update: {
          city_id?: string
          created_at?: string | null
          current_weather?: Json
          data_source?: string | null
          id?: string
          internet_speed?: number | null
          monthly_budget?: number | null
          rent_studio?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_metrics_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_weather: {
        Row: {
          aqi: number | null
          avg_temp: number
          city_id: string
          created_at: string | null
          data_source: string | null
          id: string
          max_temp: number
          min_temp: number
          month: number
          rainfall: number
          updated_at: string | null
          year: number
        }
        Insert: {
          aqi?: number | null
          avg_temp: number
          city_id: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          max_temp: number
          min_temp: number
          month: number
          rainfall?: number
          updated_at?: string | null
          year?: number
        }
        Update: {
          aqi?: number | null
          avg_temp?: number
          city_id?: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          max_temp?: number
          min_temp?: number
          month?: number
          rainfall?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_weather_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_city_reactions: {
        Row: {
          city_dislike: boolean
          city_id: string
          city_like: boolean
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city_dislike?: boolean
          city_id: string
          city_like?: boolean
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city_dislike?: boolean
          city_id?: string
          city_like?: boolean
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_city_reactions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_city_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ratings: {
        Row: {
          city_id: string
          created_at: string | null
          id: string
          overall_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city_id: string
          created_at?: string | null
          id?: string
          overall_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city_id?: string
          created_at?: string | null
          id?: string
          overall_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reviews: {
        Row: {
          city_id: string
          content: string
          created_at: string | null
          hidden: boolean
          id: string
          rating: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city_id: string
          content: string
          created_at?: string | null
          hidden?: boolean
          id?: string
          rating: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city_id?: string
          content?: string
          created_at?: string | null
          hidden?: boolean
          id?: string
          rating?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      workspace_review_images: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number
          file_size: number | null
          id: string
          image_url: string
          is_hidden: boolean
          original_filename: string | null
          review_id: string
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number
          file_size?: number | null
          id?: string
          image_url: string
          is_hidden?: boolean
          original_filename?: string | null
          review_id: string
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number
          file_size?: number | null
          id?: string
          image_url?: string
          is_hidden?: boolean
          original_filename?: string | null
          review_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_review_images_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "workspace_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_reviews: {
        Row: {
          content: string
          created_at: string | null
          has_images: boolean
          hidden: boolean
          id: string
          is_recommended: boolean | null
          rating: number
          title: string
          updated_at: string | null
          user_id: string
          visited_at: string | null
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          has_images?: boolean
          hidden?: boolean
          id?: string
          is_recommended?: boolean | null
          rating: number
          title: string
          updated_at?: string | null
          user_id: string
          visited_at?: string | null
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          has_images?: boolean
          hidden?: boolean
          id?: string
          is_recommended?: boolean | null
          rating?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          visited_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_reviews_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_suggestions: {
        Row: {
          address: string
          admin_note: string | null
          approved_workspace_id: string | null
          city_id: string
          created_at: string | null
          description: string | null
          has_power: boolean | null
          id: string
          image_path: string | null
          latitude: number | null
          longitude: number | null
          name: string
          name_en: string | null
          opening_hours: string | null
          phone: string | null
          price_range: Database["public"]["Enums"]["price_range_type"] | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["suggestion_status"]
          type: Database["public"]["Enums"]["workspace_type"]
          updated_at: string | null
          user_id: string
          website: string | null
          wifi_speed: number | null
        }
        Insert: {
          address: string
          admin_note?: string | null
          approved_workspace_id?: string | null
          city_id: string
          created_at?: string | null
          description?: string | null
          has_power?: boolean | null
          id?: string
          image_path?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_en?: string | null
          opening_hours?: string | null
          phone?: string | null
          price_range?: Database["public"]["Enums"]["price_range_type"] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          type?: Database["public"]["Enums"]["workspace_type"]
          updated_at?: string | null
          user_id: string
          website?: string | null
          wifi_speed?: number | null
        }
        Update: {
          address?: string
          admin_note?: string | null
          approved_workspace_id?: string | null
          city_id?: string
          created_at?: string | null
          description?: string | null
          has_power?: boolean | null
          id?: string
          image_path?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_en?: string | null
          opening_hours?: string | null
          phone?: string | null
          price_range?: Database["public"]["Enums"]["price_range_type"] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          type?: Database["public"]["Enums"]["workspace_type"]
          updated_at?: string | null
          user_id?: string
          website?: string | null
          wifi_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_suggestions_approved_workspace_id_fkey"
            columns: ["approved_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_suggestions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          address: string
          average_rating: number | null
          city_id: string
          created_at: string | null
          data_source: string | null
          description: string | null
          has_power: boolean | null
          id: string
          image_url: string | null
          is_hidden: boolean
          latitude: number | null
          longitude: number | null
          name: string
          name_en: string | null
          opening_hours: string | null
          phone: string | null
          price_range: Database["public"]["Enums"]["price_range_type"] | null
          review_count: number | null
          type: Database["public"]["Enums"]["workspace_type"]
          updated_at: string | null
          website: string | null
          wifi_speed: number | null
        }
        Insert: {
          address: string
          average_rating?: number | null
          city_id: string
          created_at?: string | null
          data_source?: string | null
          description?: string | null
          has_power?: boolean | null
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          name_en?: string | null
          opening_hours?: string | null
          phone?: string | null
          price_range?: Database["public"]["Enums"]["price_range_type"] | null
          review_count?: number | null
          type?: Database["public"]["Enums"]["workspace_type"]
          updated_at?: string | null
          website?: string | null
          wifi_speed?: number | null
        }
        Update: {
          address?: string
          average_rating?: number | null
          city_id?: string
          created_at?: string | null
          data_source?: string | null
          description?: string | null
          has_power?: boolean | null
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_en?: string | null
          opening_hours?: string | null
          phone?: string | null
          price_range?: Database["public"]["Enums"]["price_range_type"] | null
          review_count?: number | null
          type?: Database["public"]["Enums"]["workspace_type"]
          updated_at?: string | null
          website?: string | null
          wifi_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      aqi_label_type: "좋음" | "보통" | "나쁨" | "매우나쁨"
      environment_type: "nature" | "urban" | "cafe" | "coworking"
      price_range_type: "free" | "low" | "medium" | "high"
      region_type:
        | "jeju"
        | "gyeongsang"
        | "gangwon"
        | "jeolla"
        | "chungcheong"
        | "seoul"
        | "gyeonggi"
      season_type: "spring" | "summer" | "fall" | "winter"
      suggestion_status: "pending" | "approved" | "rejected"
      user_role: "user" | "admin"
      workspace_type: "cafe" | "coworking" | "library" | "hotel_lobby" | "other"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      aqi_label_type: ["좋음", "보통", "나쁨", "매우나쁨"],
      environment_type: ["nature", "urban", "cafe", "coworking"],
      price_range_type: ["free", "low", "medium", "high"],
      region_type: [
        "jeju",
        "gyeongsang",
        "gangwon",
        "jeolla",
        "chungcheong",
        "seoul",
        "gyeonggi",
      ],
      season_type: ["spring", "summer", "fall", "winter"],
      suggestion_status: ["pending", "approved", "rejected"],
      user_role: ["user", "admin"],
      workspace_type: ["cafe", "coworking", "library", "hotel_lobby", "other"],
    },
  },
} as const

