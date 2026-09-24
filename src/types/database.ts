export type ArticleStatus = "draft" | "published";
export type ServiceCategory = "personal" | "corporate";
export type InquiryType = "contact" | "personal" | "corporate" | "partner";

export type Page = {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export type Section = {
  id: string;
  page_id: string;
  section_key: string;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  media_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type Article = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  tags: string[];
  thumbnail_url: string | null;
  excerpt: string | null;
  body: string;
  status: ArticleStatus;
  published_at: string | null;
  author: string | null;
  created_at: string;
  updated_at: string;
}

export type Service = {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type MediaAsset = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export type Inquiry = {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      pages: {
        Row: Page;
        Insert: Partial<Page> & Pick<Page, "slug" | "title">;
        Update: Partial<Page>;
        Relationships: [];
      };
      sections: {
        Row: Section;
        Insert: Partial<Section> & Pick<Section, "page_id" | "section_key">;
        Update: Partial<Section>;
        Relationships: [];
      };
      articles: {
        Row: Article;
        Insert: Partial<Article> & Pick<Article, "slug" | "title">;
        Update: Partial<Article>;
        Relationships: [];
      };
      services: {
        Row: Service;
        Insert: Partial<Service> & Pick<Service, "slug" | "title" | "category">;
        Update: Partial<Service>;
        Relationships: [];
      };
      media_assets: {
        Row: MediaAsset;
        Insert: Partial<MediaAsset> &
          Pick<MediaAsset, "file_name" | "file_path" | "file_type">;
        Update: Partial<MediaAsset>;
        Relationships: [];
      };
      inquiries: {
        Row: Inquiry;
        Insert: Partial<Inquiry> & Pick<Inquiry, "type" | "name" | "email">;
        Update: Partial<Inquiry>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
