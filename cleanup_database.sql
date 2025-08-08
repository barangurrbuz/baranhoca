-- Mevcut tabloları temizleme komutları
-- Bu komutları Supabase SQL Editor'da çalıştırın

-- 1. Önce bağımlılıkları olan tabloları sil
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;
DROP TABLE IF EXISTS study_statistics CASCADE;
DROP TABLE IF EXISTS motivation_data CASCADE;
DROP TABLE IF EXISTS study_plans CASCADE;
DROP TABLE IF EXISTS gamification_data CASCADE;
DROP TABLE IF EXISTS badge_definitions CASCADE;

-- 2. Mevcut tabloları sil
DROP TABLE IF EXISTS gunluk_cozum CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS ogrenciler CASCADE;

-- 3. Trigger'ları sil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_gamification_data_updated_at ON gamification_data;
DROP TRIGGER IF EXISTS update_study_plans_updated_at ON study_plans;
DROP TRIGGER IF EXISTS update_motivation_data_updated_at ON motivation_data;
DROP TRIGGER IF EXISTS update_user_goals_updated_at ON user_goals;

-- 4. Fonksiyonları sil
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_default_gamification_data(UUID);
DROP FUNCTION IF EXISTS create_default_motivation_data(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 5. İndeksleri sil
DROP INDEX IF EXISTS idx_gamification_data_user_id;
DROP INDEX IF EXISTS idx_study_plans_user_id;
DROP INDEX IF EXISTS idx_motivation_data_user_id;
DROP INDEX IF EXISTS idx_study_statistics_user_id;
DROP INDEX IF EXISTS idx_study_statistics_date;
DROP INDEX IF EXISTS idx_user_goals_user_id;
DROP INDEX IF EXISTS idx_study_sessions_user_id;
DROP INDEX IF EXISTS idx_study_sessions_start;

-- Temizlik tamamlandı!
-- Şimdi database_setup.sql dosyasını çalıştırabilirsiniz
