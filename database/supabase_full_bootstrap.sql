-- ====================================================================
-- VOP / MochiMochi Complete Bootstrap & RLS Script for Supabase
-- Target: Supabase Cloud PostgreSQL
-- Features: Multi-User Isolation (auth.users), Multi-Language (en, ja, es, it),
--           Image-to-Meaning, RLS Policies, Ebbinghaus SRS
-- ====================================================================

BEGIN;

-- 1. Create custom ENUM types if not existing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'practice_session_status') THEN
        CREATE TYPE practice_session_status AS ENUM ('in_progress', 'completed', 'abandoned');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_word_source') THEN
        CREATE TYPE session_word_source AS ENUM ('new_word', 'due_review', 'extra_practice');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exercise_type') THEN
        CREATE TYPE exercise_type AS ENUM ('meaning_mcq', 'listen_choose', 'listen_type', 'fill_blank');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attempt_role') THEN
        CREATE TYPE attempt_role AS ENUM ('assessment', 'reinforcement');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_outcome') THEN
        CREATE TYPE review_outcome AS ENUM ('passed', 'failed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flashcard_rating') THEN
        CREATE TYPE flashcard_rating AS ENUM ('remembered', 'forgotten');
    END IF;
END $$;

-- 2. Vocabularies Table
CREATE TABLE IF NOT EXISTS vocabularies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  language varchar(10) NOT NULL DEFAULT 'en',
  phonetic_reading text,
  script_type varchar(50),
  image_url text,
  term varchar(255) NOT NULL,
  normalized_term varchar(255) NOT NULL,
  ipa varchar(160),
  audio_url text,
  is_suspended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes for vocabularies
DROP INDEX IF EXISTS vocabularies_normalized_term_key;
DROP INDEX IF EXISTS vocabularies_normalized_term_idx;
CREATE UNIQUE INDEX IF NOT EXISTS ix_vocabularies_user_term_lang 
  ON vocabularies(user_id, normalized_term, language) 
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_vocabularies_user_lang 
  ON vocabularies(user_id, language);
CREATE INDEX IF NOT EXISTS ix_vocabularies_created_at 
  ON vocabularies(created_at);

-- 3. Vocabulary Meanings Table
CREATE TABLE IF NOT EXISTS vocabulary_meanings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_id uuid NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
  meaning_vi text NOT NULL,
  part_of_speech varchar(40),
  ipa_override varchar(160),
  display_order int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- 4. Vocabulary Examples Table
CREATE TABLE IF NOT EXISTS vocabulary_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meaning_id uuid NOT NULL REFERENCES vocabulary_meanings(id) ON DELETE CASCADE,
  sentence_en text NOT NULL,
  sentence_vi text,
  cloze_sentence_en text,
  cloze_answer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Learning Progress (SRS Mochi 5 Tiers)
CREATE TABLE IF NOT EXISTS learning_progress (
  vocabulary_id uuid PRIMARY KEY REFERENCES vocabularies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  level smallint NOT NULL DEFAULT 0,
  first_learned_at timestamptz,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  is_suspended boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (level BETWEEN 0 AND 5)
);

CREATE INDEX IF NOT EXISTS ix_learning_progress_user_due 
  ON learning_progress(user_id, next_review_at) 
  WHERE is_suspended = false;

-- 6. Practice Sessions Table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  language varchar(10) NOT NULL DEFAULT 'en',
  status practice_session_status NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS ix_practice_sessions_user 
  ON practice_sessions(user_id, started_at DESC);

-- 7. Session Words Table
CREATE TABLE IF NOT EXISTS session_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  vocabulary_id uuid NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
  source session_word_source NOT NULL,
  level_at_start smallint NOT NULL,
  position int NOT NULL,
  meaning_id uuid REFERENCES vocabulary_meanings(id) ON DELETE SET NULL,
  question_plan text,
  is_legacy boolean NOT NULL DEFAULT false
);

-- 8. Exercise Attempts Table
CREATE TABLE IF NOT EXISTS exercise_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_word_id uuid NOT NULL REFERENCES session_words(id) ON DELETE CASCADE,
  exercise_type exercise_type NOT NULL,
  role attempt_role NOT NULL,
  question_snapshot text,
  submitted_answer text,
  is_correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  meaning_id uuid REFERENCES vocabulary_meanings(id) ON DELETE SET NULL,
  example_id uuid REFERENCES vocabulary_examples(id) ON DELETE SET NULL
);

-- 9. Flashcard Reviews Table
CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id uuid NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
  rating flashcard_rating NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  meaning_id uuid REFERENCES vocabulary_meanings(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_flashcard_reviews_user 
  ON flashcard_reviews(user_id, reviewed_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_meanings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;

-- Vocabularies Policy
DROP POLICY IF EXISTS "Users can only access their own vocabularies" ON vocabularies;
CREATE POLICY "Users can only access their own vocabularies"
  ON vocabularies
  FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Learning Progress Policy
DROP POLICY IF EXISTS "Users can only access their own learning progress" ON learning_progress;
CREATE POLICY "Users can only access their own learning progress"
  ON learning_progress
  FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Practice Sessions Policy
DROP POLICY IF EXISTS "Users can only access their own practice sessions" ON practice_sessions;
CREATE POLICY "Users can only access their own practice sessions"
  ON practice_sessions
  FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Flashcard Reviews Policy
DROP POLICY IF EXISTS "Users can only access their own flashcard reviews" ON flashcard_reviews;
CREATE POLICY "Users can only access their own flashcard reviews"
  ON flashcard_reviews
  FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Meanings & Examples: Accessible if parent vocabulary belongs to user
DROP POLICY IF EXISTS "Users can access meanings of their vocabularies" ON vocabulary_meanings;
CREATE POLICY "Users can access meanings of their vocabularies"
  ON vocabulary_meanings
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM vocabularies v WHERE v.id = vocabulary_meanings.vocabulary_id AND (v.user_id = auth.uid() OR v.user_id IS NULL)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM vocabularies v WHERE v.id = vocabulary_meanings.vocabulary_id AND v.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can access examples of their meanings" ON vocabulary_examples;
CREATE POLICY "Users can access examples of their meanings"
  ON vocabulary_examples
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM vocabulary_meanings m 
    JOIN vocabularies v ON v.id = m.vocabulary_id
    WHERE m.id = vocabulary_examples.meaning_id AND (v.user_id = auth.uid() OR v.user_id IS NULL)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM vocabulary_meanings m 
    JOIN vocabularies v ON v.id = m.vocabulary_id
    WHERE m.id = vocabulary_examples.meaning_id AND v.user_id = auth.uid()
  ));

-- Session Words & Attempts: Accessible if session belongs to user
DROP POLICY IF EXISTS "Users can access session words of their sessions" ON session_words;
CREATE POLICY "Users can access session words of their sessions"
  ON session_words
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM practice_sessions s WHERE s.id = session_words.session_id AND (s.user_id = auth.uid() OR s.user_id IS NULL)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM practice_sessions s WHERE s.id = session_words.session_id AND s.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can access exercise attempts of their sessions" ON exercise_attempts;
CREATE POLICY "Users can access exercise attempts of their sessions"
  ON exercise_attempts
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM session_words sw
    JOIN practice_sessions s ON s.id = sw.session_id
    WHERE sw.id = exercise_attempts.session_word_id AND (s.user_id = auth.uid() OR s.user_id IS NULL)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM session_words sw
    JOIN practice_sessions s ON s.id = sw.session_id
    WHERE sw.id = exercise_attempts.session_word_id AND s.user_id = auth.uid()
  ));

COMMIT;
