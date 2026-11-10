\set ON_ERROR_STOP on
BEGIN;
DO $$
BEGIN
  ASSERT (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name <> '__EFMigrationsHistory')=9, '9 tables';
  ASSERT (SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')=6, '6 enums';
  ASSERT (SELECT count(*) FROM pg_constraint WHERE connamespace='public'::regnamespace AND contype='f')=11, '11 foreign keys';
  ASSERT (SELECT count(*) FROM pg_indexes WHERE schemaname='public' AND tablename <> '__EFMigrationsHistory')=28, '28 indexes incl PK and uniqueness';
END $$;
DO $$
DECLARE v uuid; m uuid; e uuid; s uuid; sw uuid;
BEGIN
 INSERT INTO vocabularies(term, normalized_term) VALUES ('test','test') RETURNING id INTO v;
 INSERT INTO vocabulary_meanings(vocabulary_id,meaning_vi) VALUES(v,'kiểm tra') RETURNING id INTO m;
 INSERT INTO vocabulary_examples(meaning_id,sentence_en) VALUES(m,'Test sentence') RETURNING id INTO e;
 INSERT INTO learning_progress(vocabulary_id) VALUES(v);
 INSERT INTO practice_sessions DEFAULT VALUES RETURNING id INTO s;
 INSERT INTO session_words(session_id,vocabulary_id,source,position,level_at_start) VALUES(s,v,'new_word',1,0) RETURNING id INTO sw;
 INSERT INTO exercise_attempts(session_word_id,meaning_id,example_id,exercise_type,is_correct) VALUES(sw,m,e,'meaning_mcq',true);
 INSERT INTO review_evaluations(session_word_id,outcome,level_before,level_after) VALUES(sw,'passed',0,1);
 INSERT INTO flashcard_reviews(vocabulary_id,meaning_id,rating) VALUES(v,m,'remembered');
 BEGIN
  INSERT INTO vocabularies(term,normalized_term) VALUES('duplicate','test');
  RAISE EXCEPTION 'duplicate normalized_term accepted';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN
  UPDATE learning_progress SET level=6 WHERE vocabulary_id=v;
  RAISE EXCEPTION 'invalid level accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  INSERT INTO session_words(session_id,vocabulary_id,source,position,level_at_start) VALUES(s,gen_random_uuid(),'new_word',2,0);
  RAISE EXCEPTION 'missing FK accepted';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 BEGIN
  DELETE FROM vocabularies WHERE id=v;
  RAISE EXCEPTION 'restricted vocabulary deletion accepted';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 BEGIN
  DELETE FROM vocabulary_meanings WHERE id=m;
  RAISE EXCEPTION 'restricted meaning deletion accepted';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 DELETE FROM vocabulary_examples WHERE id=e;
 ASSERT (SELECT example_id IS NULL FROM exercise_attempts WHERE session_word_id=sw), 'example SET NULL';
 DELETE FROM vocabulary_meanings WHERE id=m;
 ASSERT (SELECT meaning_id IS NULL FROM exercise_attempts WHERE session_word_id=sw), 'attempt meaning SET NULL';
 ASSERT (SELECT meaning_id IS NULL FROM flashcard_reviews WHERE vocabulary_id=v), 'flashcard meaning SET NULL';
END $$;
ROLLBACK;
SELECT 'VOP schema checks passed' AS result;
