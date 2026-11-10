-- VOP: initial schema, translated from supplied DBML.
BEGIN;

CREATE TYPE practice_session_status AS ENUM ('in_progress', 'completed', 'abandoned');

CREATE TYPE session_word_source AS ENUM ('new_word', 'due_review', 'extra_practice');

CREATE TYPE exercise_type AS ENUM ('meaning_mcq', 'listen_choose', 'listen_type', 'fill_blank');

CREATE TYPE attempt_role AS ENUM ('assessment', 'reinforcement');

CREATE TYPE review_outcome AS ENUM ('passed', 'failed');

CREATE TYPE flashcard_rating AS ENUM ('remembered', 'forgotten');

CREATE TABLE vocabularies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term varchar(255) NOT NULL,
  normalized_term varchar(255) NOT NULL UNIQUE,
  ipa varchar(160),
  audio_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE vocabulary_meanings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_id uuid NOT NULL,
  meaning_vi text NOT NULL,
  part_of_speech varchar(40),
  ipa_override varchar(160),
  display_order int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vocabulary_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meaning_id uuid NOT NULL,
  sentence_en text NOT NULL,
  sentence_vi text,
  cloze_sentence_en text,
  cloze_answer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE learning_progress (
  vocabulary_id uuid PRIMARY KEY,
  level smallint NOT NULL DEFAULT 0,
  first_learned_at timestamptz,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  is_suspended boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (level BETWEEN 0 AND 5)
);

CREATE TABLE practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status practice_session_status NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE TABLE session_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  vocabulary_id uuid NOT NULL,
  source session_word_source NOT NULL,
  position int NOT NULL,
  level_at_start smallint NOT NULL,
  CHECK (level_at_start BETWEEN 0 AND 5)
);

CREATE TABLE exercise_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_word_id uuid NOT NULL,
  meaning_id uuid,
  example_id uuid,
  exercise_type exercise_type NOT NULL,
  role attempt_role NOT NULL DEFAULT 'assessment',
  question_snapshot jsonb,
  submitted_answer text,
  is_correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE review_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_word_id uuid NOT NULL UNIQUE,
  outcome review_outcome NOT NULL,
  level_before smallint NOT NULL,
  level_after smallint NOT NULL,
  previous_review_at timestamptz,
  next_review_at timestamptz,
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (level_before BETWEEN 0 AND 5),
  CHECK (level_after BETWEEN 0 AND 5)
);

CREATE TABLE flashcard_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_id uuid NOT NULL,
  meaning_id uuid,
  rating flashcard_rating NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vocabulary_meanings ADD CONSTRAINT vocabulary_meanings_vocabulary_id_fkey FOREIGN KEY (vocabulary_id) REFERENCES vocabularies (id) ON DELETE RESTRICT;
ALTER TABLE vocabulary_examples ADD CONSTRAINT vocabulary_examples_meaning_id_fkey FOREIGN KEY (meaning_id) REFERENCES vocabulary_meanings (id) ON DELETE RESTRICT;
ALTER TABLE learning_progress ADD CONSTRAINT learning_progress_vocabulary_id_fkey FOREIGN KEY (vocabulary_id) REFERENCES vocabularies (id) ON DELETE RESTRICT;
ALTER TABLE session_words ADD CONSTRAINT session_words_session_id_fkey FOREIGN KEY (session_id) REFERENCES practice_sessions (id) ON DELETE RESTRICT;
ALTER TABLE session_words ADD CONSTRAINT session_words_vocabulary_id_fkey FOREIGN KEY (vocabulary_id) REFERENCES vocabularies (id) ON DELETE RESTRICT;
ALTER TABLE exercise_attempts ADD CONSTRAINT exercise_attempts_session_word_id_fkey FOREIGN KEY (session_word_id) REFERENCES session_words (id) ON DELETE RESTRICT;
ALTER TABLE exercise_attempts ADD CONSTRAINT exercise_attempts_meaning_id_fkey FOREIGN KEY (meaning_id) REFERENCES vocabulary_meanings (id) ON DELETE SET NULL;
ALTER TABLE exercise_attempts ADD CONSTRAINT exercise_attempts_example_id_fkey FOREIGN KEY (example_id) REFERENCES vocabulary_examples (id) ON DELETE SET NULL;
ALTER TABLE review_evaluations ADD CONSTRAINT review_evaluations_session_word_id_fkey FOREIGN KEY (session_word_id) REFERENCES session_words (id) ON DELETE RESTRICT;
ALTER TABLE flashcard_reviews ADD CONSTRAINT flashcard_reviews_vocabulary_id_fkey FOREIGN KEY (vocabulary_id) REFERENCES vocabularies (id) ON DELETE RESTRICT;
ALTER TABLE flashcard_reviews ADD CONSTRAINT flashcard_reviews_meaning_id_fkey FOREIGN KEY (meaning_id) REFERENCES vocabulary_meanings (id) ON DELETE SET NULL;
CREATE INDEX vocabularies_created_at_idx ON vocabularies (created_at);
CREATE INDEX vocabularies_deleted_at_idx ON vocabularies (deleted_at);
CREATE UNIQUE INDEX vocabulary_meanings_vocabulary_id_display_order_key ON vocabulary_meanings (vocabulary_id, display_order);
CREATE INDEX vocabulary_examples_meaning_id_idx ON vocabulary_examples (meaning_id);
CREATE INDEX learning_progress_is_suspended_next_review_at_idx ON learning_progress (is_suspended, next_review_at);
CREATE INDEX learning_progress_level_idx ON learning_progress (level);
CREATE INDEX practice_sessions_started_at_idx ON practice_sessions (started_at);
CREATE INDEX practice_sessions_status_started_at_idx ON practice_sessions (status, started_at);
CREATE UNIQUE INDEX session_words_session_id_vocabulary_id_key ON session_words (session_id, vocabulary_id);
CREATE UNIQUE INDEX session_words_session_id_position_key ON session_words (session_id, position);
CREATE INDEX session_words_vocabulary_id_idx ON session_words (vocabulary_id);
CREATE INDEX exercise_attempts_session_word_id_answered_at_idx ON exercise_attempts (session_word_id, answered_at);
CREATE INDEX exercise_attempts_exercise_type_answered_at_idx ON exercise_attempts (exercise_type, answered_at);
CREATE INDEX review_evaluations_evaluated_at_idx ON review_evaluations (evaluated_at);
CREATE INDEX review_evaluations_level_after_evaluated_at_idx ON review_evaluations (level_after, evaluated_at);
CREATE INDEX flashcard_reviews_vocabulary_id_reviewed_at_idx ON flashcard_reviews (vocabulary_id, reviewed_at);
CREATE INDEX flashcard_reviews_reviewed_at_idx ON flashcard_reviews (reviewed_at);

COMMIT;
