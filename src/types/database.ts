export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          company_name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          company_name: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      dealer_preferences: {
        Row: {
          id: string;
          dealer_id: string;
          preferred_brands: string[];
          preferred_models: string[];
          min_year: number;
          max_mileage: number;
          min_price: number | null;
          max_price: number | null;
          min_expected_profit: number;
          fuel_types: string[];
          transmissions: string[];
          monitoring_intensity: string;
          selected_source_groups: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["dealer_preferences"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["dealer_preferences"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "dealer_preferences_dealer_id_fkey";
            columns: ["dealer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      listings: {
        Row: {
          id: string;
          source: string;
          external_id: string;
          source_url: string;
          title: string;
          brand: string;
          model: string;
          variant: string;
          year: number;
          mileage: number;
          asking_price: number;
          fuel: string;
          transmission: string;
          power_hp: number;
          location: string;
          seller_type: string;
          description: string;
          image_urls: string[];
          first_seen_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
        Relationships: [];
      };
      valuations: {
        Row: {
          id: string;
          listing_id: string;
          low_estimate: number;
          median_estimate: number;
          high_estimate: number;
          expected_costs: number;
          expected_profit: number;
          confidence_score: number;
          deal_score: number;
          reasons: string[];
          risks: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["valuations"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["valuations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "valuations_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: true;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      comparables: {
        Row: {
          id: string;
          listing_id: string;
          comparable_title: string;
          comparable_price: number;
          comparable_year: number;
          comparable_mileage: number;
          comparable_source: string;
          comparable_url: string;
        };
        Insert: Omit<Database["public"]["Tables"]["comparables"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comparables"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "comparables_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      deal_statuses: {
        Row: {
          id: string;
          dealer_id: string;
          listing_id: string;
          status: string;
          note: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["deal_statuses"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deal_statuses"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "deal_statuses_dealer_id_fkey";
            columns: ["dealer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_statuses_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
