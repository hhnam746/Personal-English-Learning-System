-- ====================================================================
-- VOP / MochiMochi Multi-User & Multi-Language Schema & RLS for Supabase
-- Target Languages: en (English), ja (Japanese), es (Spanish), it (Italian)
-- Auth: Supabase Auth (Email/Password & Google OAuth)
-- ====================================================================

-- 1. Thêm cột user_id và language vào vocabularies
ALTER TABLE vocabularies 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS phonetic_reading TEXT,
  ADD COLUMN IF NOT EXISTS script_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Xóa index unique toàn cục cũ (để nhiều user có thể cùng lưu một từ, và 1 user có thể lưu cùng từ ở 2 ngôn ngữ)
DROP INDEX IF EXISTS vocabularies_normalized_term_key;
DROP INDEX IF EXISTS vocabularies_normalized_term_idx;

-- Tạo index composite mới theo user_id, normalized_term và language
CREATE UNIQUE INDEX IF NOT EXISTS ix_vocabularies_user_term_lang 
  ON vocabularies(user_id, normalized_term, language) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_vocabularies_user_lang 
  ON vocabularies(user_id, language);

-- 2. Thêm user_id vào learning_progress
ALTER TABLE learning_progress 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS ix_learning_progress_user_due 
  ON learning_progress(user_id, next_review_at) 
  WHERE is_suspended = false;

-- 3. Thêm user_id và language vào practice_sessions
ALTER TABLE practice_sessions 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'en';

CREATE INDEX IF NOT EXISTS ix_practice_sessions_user 
  ON practice_sessions(user_id, started_at DESC);

-- 4. Thêm user_id vào flashcard_reviews
ALTER TABLE flashcard_reviews 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS ix_flashcard_reviews_user 
  ON flashcard_reviews(user_id, reviewed_at DESC);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================

-- Bật RLS
ALTER TABLE vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

-- Policies cho vocabularies
DROP POLICY IF EXISTS "Users can only select their own vocabularies" ON vocabularies;
CREATE POLICY "Users can only select their own vocabularies"
  ON vocabularies FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own vocabularies" ON vocabularies;
CREATE POLICY "Users can only insert their own vocabularies"
  ON vocabularies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own vocabularies" ON vocabularies;
CREATE POLICY "Users can only update their own vocabularies"
  ON vocabularies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own vocabularies" ON vocabularies;
CREATE POLICY "Users can only delete their own vocabularies"
  ON vocabularies FOR DELETE
  USING (auth.uid() = user_id);

-- Policies cho learning_progress
DROP POLICY IF EXISTS "Users can access their own learning progress" ON learning_progress;
CREATE POLICY "Users can access their own learning progress"
  ON learning_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies cho practice_sessions
DROP POLICY IF EXISTS "Users can access their own practice sessions" ON practice_sessions;
CREATE POLICY "Users can access their own practice sessions"
  ON practice_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies cho flashcard_reviews
DROP POLICY IF EXISTS "Users can access their own flashcard reviews" ON flashcard_reviews;
CREATE POLICY "Users can access their own flashcard reviews"
  ON flashcard_reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
