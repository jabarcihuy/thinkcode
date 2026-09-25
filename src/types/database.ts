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
      ai_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_sessions: {
        Row: {
          created_at: string
          exercise_id: string | null
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "published_exercise_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_items: {
        Row: {
          answer_config: Json
          assessment_id: string
          entry_function: string | null
          id: string
          position: number
          prompt: string
          public_config: Json
          starter_code: string | null
          title: string
          topic: string
          type: Database["public"]["Enums"]["exercise_type"]
          weight: number
        }
        Insert: {
          answer_config?: Json
          assessment_id: string
          entry_function?: string | null
          id?: string
          position: number
          prompt: string
          public_config?: Json
          starter_code?: string | null
          title: string
          topic: string
          type: Database["public"]["Enums"]["exercise_type"]
          weight?: number
        }
        Update: {
          answer_config?: Json
          assessment_id?: string
          entry_function?: string | null
          id?: string
          position?: number
          prompt?: string
          public_config?: Json
          starter_code?: string | null
          title?: string
          topic?: string
          type?: Database["public"]["Enums"]["exercise_type"]
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_items_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_results: {
        Row: {
          assessment_id: string
          attempt_count: number
          completed_at: string | null
          highest_score: number
          id: string
          latest_score: number
          passed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_id: string
          attempt_count?: number
          completed_at?: string | null
          highest_score?: number
          id?: string
          latest_score?: number
          passed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_id?: string
          attempt_count?: number
          completed_at?: string | null
          highest_score?: number
          id?: string
          latest_score?: number
          passed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_sessions: {
        Row: {
          answers: Json
          assessment_id: string
          completed_at: string | null
          id: string
          safe_feedback: Json
          score: number | null
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          answers?: Json
          assessment_id: string
          completed_at?: string | null
          id?: string
          safe_feedback?: Json
          score?: number | null
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          answers?: Json
          assessment_id?: string
          completed_at?: string | null
          id?: string
          safe_feedback?: Json
          score?: number | null
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_test_cases: {
        Row: {
          args: Json
          assessment_item_id: string
          expected_output: string
          id: string
          is_hidden: boolean
          position: number
          stdin: string
          weight: number
        }
        Insert: {
          args?: Json
          assessment_item_id: string
          expected_output: string
          id?: string
          is_hidden?: boolean
          position: number
          stdin?: string
          weight?: number
        }
        Update: {
          args?: Json
          assessment_item_id?: string
          expected_output?: string
          id?: string
          is_hidden?: boolean
          position?: number
          stdin?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_test_cases_assessment_item_id_fkey"
            columns: ["assessment_item_id"]
            isOneToOne: false
            referencedRelation: "assessment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string
          gate_after_chapter: number
          id: string
          instructions: string
          is_published: boolean
          learning_path_id: string
          passing_score: number
          position: number
          slug: string
          title: string
          type: Database["public"]["Enums"]["assessment_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          gate_after_chapter: number
          id?: string
          instructions?: string
          is_published?: boolean
          learning_path_id: string
          passing_score?: number
          position: number
          slug: string
          title: string
          type: Database["public"]["Enums"]["assessment_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          gate_after_chapter?: number
          id?: string
          instructions?: string
          is_published?: boolean
          learning_path_id?: string
          passing_score?: number
          position?: number
          slug?: string
          title?: string
          type?: Database["public"]["Enums"]["assessment_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          created_at: string
          description: string
          id: string
          is_published: boolean
          is_required: boolean
          learning_path_id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          is_required?: boolean
          learning_path_id: string
          position: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          is_required?: boolean
          learning_path_id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      code_request_limits: {
        Row: {
          kind: string
          request_count: number
          user_id: string
          window_started_at: string
        }
        Insert: {
          kind: string
          request_count: number
          user_id: string
          window_started_at: string
        }
        Update: {
          kind?: string
          request_count?: number
          user_id?: string
          window_started_at?: string
        }
        Relationships: []
      }
      exercise_attempts: {
        Row: {
          answer: Json | null
          created_at: string
          exercise_id: string
          feedback: Json
          id: string
          passed: boolean
          score: number
          source_code: string | null
          user_id: string
        }
        Insert: {
          answer?: Json | null
          created_at?: string
          exercise_id: string
          feedback?: Json
          id?: string
          passed: boolean
          score: number
          source_code?: string | null
          user_id: string
        }
        Update: {
          answer?: Json | null
          created_at?: string
          exercise_id?: string
          feedback?: Json
          id?: string
          passed?: boolean
          score?: number
          source_code?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "published_exercise_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_published: boolean
          is_required: boolean
          lesson_id: string
          position: number
          prompt: string
          public_config: Json | null
          solution_code: string | null
          starter_code: string | null
          title: string
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          is_required?: boolean
          lesson_id: string
          position: number
          prompt: string
          public_config?: Json | null
          solution_code?: string | null
          starter_code?: string | null
          title: string
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          is_required?: boolean
          lesson_id?: string
          position?: number
          prompt?: string
          public_config?: Json | null
          solution_code?: string | null
          starter_code?: string | null
          title?: string
          type?: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string
          id: string
          is_published: boolean
          position: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          position?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          position?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string
          started_at: string
          status: Database["public"]["Enums"]["lesson_progress_status"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["lesson_progress_status"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["lesson_progress_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          chapter_id: string
          content: string
          created_at: string
          example_source_code: string | null
          id: string
          is_preview: boolean
          is_published: boolean
          is_required: boolean
          position: number
          slug: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          content?: string
          created_at?: string
          example_source_code?: string | null
          id?: string
          is_preview?: boolean
          is_published?: boolean
          is_required?: boolean
          position: number
          slug: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          content?: string
          created_at?: string
          example_source_code?: string | null
          id?: string
          is_preview?: boolean
          is_published?: boolean
          is_required?: boolean
          position?: number
          slug?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      test_cases: {
        Row: {
          exercise_id: string
          expected_output: string | null
          id: string
          is_hidden: boolean
          position: number
          stdin: string | null
          weight: number
        }
        Insert: {
          exercise_id: string
          expected_output?: string | null
          id?: string
          is_hidden?: boolean
          position: number
          stdin?: string | null
          weight?: number
        }
        Update: {
          exercise_id?: string
          expected_output?: string | null
          id?: string
          is_hidden?: boolean
          position?: number
          stdin?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cases_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "published_exercise_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      published_exercise_catalog: {
        Row: {
          id: string | null
          is_required: boolean | null
          lesson_id: string | null
          position: number | null
          prompt: string | null
          public_config: Json | null
          starter_code: string | null
          title: string | null
          type: Database["public"]["Enums"]["exercise_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      published_visible_test_cases: {
        Row: {
          exercise_id: string | null
          expected_output: string | null
          id: string | null
          position: number | null
          stdin: string | null
          weight: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cases_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "published_exercise_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      consume_code_request_quota: { Args: { p_kind: string }; Returns: boolean }
      current_user_has_active_assessment: { Args: never; Returns: boolean }
      current_user_lesson_available: {
        Args: { p_lesson_id: string }
        Returns: boolean
      }
      finalize_assessment_session: {
        Args: {
          p_answers: Json
          p_safe_feedback: Json
          p_score: number
          p_session_id: string
        }
        Returns: boolean
      }
      phase1_complete_lesson: {
        Args: { p_lesson_id: string }
        Returns: undefined
      }
      phase1_lesson_is_available: {
        Args: { p_lesson_id: string; p_user_id: string }
        Returns: boolean
      }
      phase1_start_lesson: { Args: { p_lesson_id: string }; Returns: undefined }
      phase3_record_attempt: {
        Args: {
          p_answer: Json
          p_exercise_id: string
          p_feedback: Json
          p_passed: boolean
          p_score: number
          p_source_code: string
          p_user_id: string
        }
        Returns: boolean
      }
      start_assessment_session: {
        Args: { p_assessment_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "USER" | "ADMIN"
      assessment_type: "CHECKPOINT" | "FINAL"
      exercise_type:
        | "CODE_COMPLETION"
        | "PREDICT_OUTPUT"
        | "DEBUGGING"
        | "PROBLEM_SOLVING"
        | "PSEUDOCODE"
        | "FLOWCHART"
      lesson_progress_status:
        | "LOCKED"
        | "AVAILABLE"
        | "IN_PROGRESS"
        | "COMPLETED"
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
      app_role: ["USER", "ADMIN"],
      assessment_type: ["CHECKPOINT", "FINAL"],
      exercise_type: [
        "CODE_COMPLETION",
        "PREDICT_OUTPUT",
        "DEBUGGING",
        "PROBLEM_SOLVING",
        "PSEUDOCODE",
        "FLOWCHART",
      ],
      lesson_progress_status: [
        "LOCKED",
        "AVAILABLE",
        "IN_PROGRESS",
        "COMPLETED",
      ],
    },
  },
} as const
