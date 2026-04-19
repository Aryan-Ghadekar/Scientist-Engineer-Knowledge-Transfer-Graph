-- ============================================================
-- Knowledge Transfer Graph — Supabase Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- All tables use UUIDs as primary keys for scalability.
-- RLS (Row Level Security) is enabled on every table.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.profession_type AS ENUM (
  'engineer',
  'scientist',
  'researcher',
  'student',
  'professor',
  'other'
);

-- ============================================================
-- UTILITY: updated_at auto-trigger
-- Reused across all tables — call handle_updated_at() in triggers.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users (1-to-1 via FK on id).
-- Created automatically on signup via trigger.
-- ============================================================

CREATE TABLE public.profiles (
  -- Primary Key mirrors auth.users.id
  id              UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  username        VARCHAR(50)   UNIQUE NOT NULL,
  full_name       VARCHAR(150),

  -- Professional Info
  profession      profession_type NOT NULL DEFAULT 'other',
  organization    VARCHAR(250),       -- Company / University / Research Lab
  department      VARCHAR(250),       -- Dept or field of specialization

  -- Optional extended info
  bio             TEXT,
  avatar_url      TEXT,
  website_url     TEXT,

  -- Account state
  is_active       BOOLEAN       DEFAULT TRUE NOT NULL,
  is_verified     BOOLEAN       DEFAULT FALSE NOT NULL,

  -- Timestamps
  created_at      TIMESTAMPTZ   DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ   DEFAULT NOW() NOT NULL
);

-- updated_at trigger for profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER: auto-create profile on auth.users INSERT
-- Reads metadata passed during signup (username, profession, etc.)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    profession,
    organization,
    department
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username',  'user_' || substr(NEW.id::TEXT, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'profession', 'other')::profession_type,
    COALESCE(NEW.raw_user_meta_data->>'organization', ''),
    COALESCE(NEW.raw_user_meta_data->>'department', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY — profiles
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (for graph/discovery features)
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can insert only their own row
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own row
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users cannot delete their profile directly (soft-delete via is_active)
-- Service role (admin) can delete.

-- ============================================================
-- INDEXES — profiles
-- ============================================================

CREATE INDEX idx_profiles_username     ON public.profiles(username);
CREATE INDEX idx_profiles_profession   ON public.profiles(profession);
CREATE INDEX idx_profiles_organization ON public.profiles(organization);
CREATE INDEX idx_profiles_is_active    ON public.profiles(is_active);

-- ============================================================
-- FUTURE TABLES PLACEHOLDER
-- When adding new tables, follow this pattern:
--
--   CREATE TABLE public.<table_name> (
--     id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
--     ...
--     created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
--     updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
--   );
--
--   CREATE TRIGGER <table_name>_updated_at
--     BEFORE UPDATE ON public.<table_name>
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
--
--   ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
--   -- Add policies below
-- ============================================================

-- Example: graph_nodes (uncomment when needed)
-- CREATE TABLE public.graph_nodes (
--   id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
--   owner_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
--   label       VARCHAR(200) NOT NULL,
--   node_type   VARCHAR(50),
--   metadata    JSONB       DEFAULT '{}',
--   created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
--   updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
-- );