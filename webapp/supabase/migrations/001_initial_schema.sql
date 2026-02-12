-- AlphaGenome Explorer: Initial Database Schema
-- Supports user profiles, analysis history, favorites, and saved variants

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'FREE' CHECK (role IN ('FREE', 'PREMIUM', 'ADMIN')),
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  api_key_encrypted TEXT,
  organism_preference TEXT DEFAULT 'HOMO_SAPIENS',
  default_sequence_length TEXT DEFAULT '100KB',
  favorite_tissues TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ANALYSIS HISTORY
-- ============================================
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_category TEXT,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  share_token TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX idx_analysis_history_tool_name ON analysis_history(tool_name);
CREATE INDEX idx_analysis_history_share_token ON analysis_history(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_analysis_history_created_at ON analysis_history(created_at DESC);

-- ============================================
-- USER FAVORITES
-- ============================================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tool_name)
);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);

-- ============================================
-- SAVED VARIANTS
-- ============================================
CREATE TABLE saved_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  gene TEXT,
  chromosome TEXT,
  position BIGINT,
  reference_allele TEXT,
  alternate_allele TEXT,
  significance TEXT CHECK (significance IN ('benign', 'likely_benign', 'uncertain', 'likely_pathogenic', 'pathogenic')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  source_tool TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_variants_user_id ON saved_variants(user_id);
CREATE INDEX idx_saved_variants_gene ON saved_variants(gene);
CREATE INDEX idx_saved_variants_variant ON saved_variants(variant);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_variants ENABLE ROW LEVEL SECURITY;

-- User profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid() OR wallet_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address');

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Service role can manage all profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Analysis history: users see their own, public analyses visible to all
CREATE POLICY "Users can view own analyses"
  ON analysis_history FOR SELECT
  USING (user_id = auth.uid() OR is_public = TRUE);

CREATE POLICY "Users can insert own analyses"
  ON analysis_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own analyses"
  ON analysis_history FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all analyses"
  ON analysis_history FOR ALL
  USING (auth.role() = 'service_role');

-- Favorites: users manage their own
CREATE POLICY "Users can manage own favorites"
  ON user_favorites FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all favorites"
  ON user_favorites FOR ALL
  USING (auth.role() = 'service_role');

-- Saved variants: users manage their own
CREATE POLICY "Users can manage own variants"
  ON saved_variants FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all variants"
  ON saved_variants FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_saved_variants_updated_at
  BEFORE UPDATE ON saved_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate share token for analysis
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;
