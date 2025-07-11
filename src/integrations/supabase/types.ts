export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          assets_zip_path: string | null
          created_at: string
          html_content: string
          html_file_path: string | null
          id: string
          published: boolean
          show_in_header: boolean | null
          show_in_menu: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          assets_zip_path?: string | null
          created_at?: string
          html_content: string
          html_file_path?: string | null
          id?: string
          published?: boolean
          show_in_header?: boolean | null
          show_in_menu?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          assets_zip_path?: string | null
          created_at?: string
          html_content?: string
          html_file_path?: string | null
          id?: string
          published?: boolean
          show_in_header?: boolean | null
          show_in_menu?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      global_seo_settings: {
        Row: {
          canonical_domain: string | null
          created_at: string
          custom_body_scripts: string | null
          custom_head_scripts: string | null
          facebook_pixel_id: string | null
          google_analytics_id: string | null
          google_search_console_id: string | null
          google_tag_manager_id: string | null
          id: string
          open_graph_image: string | null
          robots_txt: string | null
          schema_markup: Json | null
          site_description: string | null
          site_keywords: string | null
          site_title: string | null
          tiktok_pixel_id: string | null
          updated_at: string
        }
        Insert: {
          canonical_domain?: string | null
          created_at?: string
          custom_body_scripts?: string | null
          custom_head_scripts?: string | null
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          google_search_console_id?: string | null
          google_tag_manager_id?: string | null
          id?: string
          open_graph_image?: string | null
          robots_txt?: string | null
          schema_markup?: Json | null
          site_description?: string | null
          site_keywords?: string | null
          site_title?: string | null
          tiktok_pixel_id?: string | null
          updated_at?: string
        }
        Update: {
          canonical_domain?: string | null
          created_at?: string
          custom_body_scripts?: string | null
          custom_head_scripts?: string | null
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          google_search_console_id?: string | null
          google_tag_manager_id?: string | null
          id?: string
          open_graph_image?: string | null
          robots_txt?: string | null
          schema_markup?: Json | null
          site_description?: string | null
          site_keywords?: string | null
          site_title?: string | null
          tiktok_pixel_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      keywords: {
        Row: {
          cpc: number | null
          created_at: string
          difficulty: number | null
          id: string
          keyword: string
          search_volume: number | null
          trend_data: Json | null
          updated_at: string
        }
        Insert: {
          cpc?: number | null
          created_at?: string
          difficulty?: number | null
          id?: string
          keyword: string
          search_volume?: number | null
          trend_data?: Json | null
          updated_at?: string
        }
        Update: {
          cpc?: number | null
          created_at?: string
          difficulty?: number | null
          id?: string
          keyword?: string
          search_volume?: number | null
          trend_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      page_keywords: {
        Row: {
          created_at: string
          density: number | null
          id: string
          keyword_id: string
          page_id: string
          page_type: string
          position: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          density?: number | null
          id?: string
          keyword_id: string
          page_id: string
          page_type: string
          position?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          density?: number | null
          id?: string
          keyword_id?: string
          page_id?: string
          page_type?: string
          position?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_keywords_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      page_seo_settings: {
        Row: {
          canonical_url: string | null
          created_at: string
          custom_body_scripts: string | null
          custom_head_scripts: string | null
          focus_keywords: string[] | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          page_id: string
          page_type: string
          schema_markup: Json | null
          seo_score: number | null
          twitter_card: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          custom_body_scripts?: string | null
          custom_head_scripts?: string | null
          focus_keywords?: string[] | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_id: string
          page_type: string
          schema_markup?: Json | null
          seo_score?: number | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          custom_body_scripts?: string | null
          custom_head_scripts?: string | null
          focus_keywords?: string[] | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_id?: string
          page_type?: string
          schema_markup?: Json | null
          seo_score?: number | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          from_path: string
          id: string
          is_active: boolean
          redirect_type: number
          to_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_path: string
          id?: string
          is_active?: boolean
          redirect_type?: number
          to_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_path?: string
          id?: string
          is_active?: boolean
          redirect_type?: number
          to_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      static_pages: {
        Row: {
          assets_zip_path: string | null
          created_at: string
          html_content: string
          html_file_path: string | null
          id: string
          is_homepage: boolean | null
          show_in_header: boolean | null
          show_in_menu: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          assets_zip_path?: string | null
          created_at?: string
          html_content: string
          html_file_path?: string | null
          id?: string
          is_homepage?: boolean | null
          show_in_header?: boolean | null
          show_in_menu?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          assets_zip_path?: string | null
          created_at?: string
          html_content?: string
          html_file_path?: string | null
          id?: string
          is_homepage?: boolean | null
          show_in_header?: boolean | null
          show_in_menu?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
