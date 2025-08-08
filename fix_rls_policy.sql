-- ========================================
-- RLS'Yİ GEÇİCİ OLARAK DEVRE DIŞI BIRAKMA
-- ========================================
-- Bu komutlar kayıt işleminin çalışmasını sağlayacak

-- Tüm tablolar için RLS'yi geçici olarak devre dışı bırak
ALTER TABLE ogrenciler DISABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE motivation_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE gunluk_cozum DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- ========================================
-- NOT: Bu geçici bir çözümdür
-- ========================================
-- Kayıt işlemi tamamlandıktan sonra RLS'yi tekrar etkinleştirebilirsin:
-- ALTER TABLE ogrenciler ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gamification_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE motivation_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE study_statistics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gunluk_cozum ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
