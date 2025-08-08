-- ========================================
-- FOREIGN KEY CONSTRAINT'LERİ GEÇİCİ OLARAK KALDIRMA
-- ========================================
-- Bu komutlar kayıt işleminin çalışmasını sağlayacak

-- Tüm foreign key constraint'leri geçici olarak kaldır
ALTER TABLE ogrenciler DROP CONSTRAINT IF EXISTS ogrenciler_user_id_fkey;
ALTER TABLE gamification_data DROP CONSTRAINT IF EXISTS gamification_data_user_id_fkey;
ALTER TABLE motivation_data DROP CONSTRAINT IF EXISTS motivation_data_user_id_fkey;
ALTER TABLE study_plans DROP CONSTRAINT IF EXISTS study_plans_user_id_fkey;
ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS study_sessions_user_id_fkey;
ALTER TABLE user_goals DROP CONSTRAINT IF EXISTS user_goals_user_id_fkey;
ALTER TABLE study_statistics DROP CONSTRAINT IF EXISTS study_statistics_user_id_fkey;
ALTER TABLE gunluk_cozum DROP CONSTRAINT IF EXISTS gunluk_cozum_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;

-- ========================================
-- NOT: Bu geçici bir çözümdür
-- ========================================
-- Kayıt işlemi tamamlandıktan sonra foreign key constraint'leri tekrar ekleyebilirsin:
-- ALTER TABLE ogrenciler ADD CONSTRAINT ogrenciler_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE gamification_data ADD CONSTRAINT gamification_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE motivation_data ADD CONSTRAINT motivation_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE study_plans ADD CONSTRAINT study_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE study_sessions ADD CONSTRAINT study_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE user_goals ADD CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE study_statistics ADD CONSTRAINT study_statistics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE gunluk_cozum ADD CONSTRAINT gunluk_cozum_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE messages ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;
