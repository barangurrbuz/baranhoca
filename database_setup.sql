-- Öğrenci Koçluğu Sistemi - Veritabanı Kurulumu
-- Bu SQL komutlarını Supabase SQL Editor'da çalıştırın

-- ========================================
-- 1. TEMEL TABLOLAR
-- ========================================

-- Öğrenci bilgileri tablosu
CREATE TABLE IF NOT EXISTS ogrenciler (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  ad VARCHAR(50) NOT NULL,
  soyad VARCHAR(50) NOT NULL,
  rol VARCHAR(20) DEFAULT 'ogrenci' CHECK (rol IN ('ogrenci', 'koc')),
  sinif VARCHAR(10),
  email VARCHAR(100),
  telefon VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Günlük çözüm verileri tablosu
CREATE TABLE IF NOT EXISTS gunluk_cozum (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tarih DATE NOT NULL,
  turkce_dogru INTEGER DEFAULT 0,
  turkce_yanlis INTEGER DEFAULT 0,
  matematik_dogru INTEGER DEFAULT 0,
  matematik_yanlis INTEGER DEFAULT 0,
  fen_dogru INTEGER DEFAULT 0,
  fen_yanlis INTEGER DEFAULT 0,
  sosyal_dogru INTEGER DEFAULT 0,
  sosyal_yanlis INTEGER DEFAULT 0,
  ingilizce_dogru INTEGER DEFAULT 0,
  ingilizce_yanlis INTEGER DEFAULT 0,
  din_dogru INTEGER DEFAULT 0,
  din_yanlis INTEGER DEFAULT 0,
  calisma_suresi_dakika INTEGER DEFAULT 0,
  notlar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tarih)
);

-- Mesajlaşma tablosu
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. GAMIFICATION SİSTEMİ
-- ========================================

-- Gamification verileri tablosu
CREATE TABLE IF NOT EXISTS gamification_data (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  last_study_date DATE,
  weekly_goals JSONB DEFAULT '{
    "questions_target": 100,
    "study_hours_target": 10,
    "accuracy_target": 80
  }',
  daily_challenges JSONB DEFAULT '{
    "completed": [],
    "in_progress": [],
    "locked": []
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Başarı rozetleri tanımları tablosu
CREATE TABLE IF NOT EXISTS badge_definitions (
  id SERIAL PRIMARY KEY,
  badge_key TEXT UNIQUE NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  requirements JSONB NOT NULL,
  points_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. ÇALIŞMA PLANI SİSTEMİ
-- ========================================

-- Çalışma planları tablosu
CREATE TABLE IF NOT EXISTS study_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  daily_goals JSONB NOT NULL,
  completed_tasks JSONB DEFAULT '{}',
  study_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Çalışma oturumları tablosu
CREATE TABLE IF NOT EXISTS study_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  subject TEXT,
  questions_solved INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  session_type TEXT DEFAULT 'pomodoro' CHECK (session_type IN ('pomodoro', 'break', 'long_break')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı hedefleri tablosu
CREATE TABLE IF NOT EXISTS user_goals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  goal_subject TEXT,
  deadline DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. MOTİVASYON SİSTEMİ
-- ========================================

-- Motivasyon verileri tablosu
CREATE TABLE IF NOT EXISTS motivation_data (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_motivation TEXT,
  personal_tips JSONB DEFAULT '{}',
  study_reminders JSONB DEFAULT '[]',
  favorite_quotes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. İSTATİSTİK SİSTEMİ
-- ========================================

-- Çalışma istatistikleri tablosu
CREATE TABLE IF NOT EXISTS study_statistics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  subjects_studied TEXT[] DEFAULT '{}',
  accuracy_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. İNDEKSLER
-- ========================================

-- Performans için indeksler
CREATE INDEX IF NOT EXISTS idx_ogrenciler_user_id ON ogrenciler(user_id);
CREATE INDEX IF NOT EXISTS idx_gunluk_cozum_user_id ON gunluk_cozum(user_id);
CREATE INDEX IF NOT EXISTS idx_gunluk_cozum_tarih ON gunluk_cozum(tarih);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Gamification indeksleri
CREATE INDEX IF NOT EXISTS idx_gamification_data_user_id ON gamification_data(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_key ON badge_definitions(badge_key);

-- Study plan indeksleri
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_week_start ON study_plans(week_start);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start ON study_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(goal_type);

-- Motivation indeksleri
CREATE INDEX IF NOT EXISTS idx_motivation_data_user_id ON motivation_data(user_id);

-- Statistics indeksleri
CREATE INDEX IF NOT EXISTS idx_study_statistics_user_id ON study_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_study_statistics_date ON study_statistics(study_date);

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ========================================

-- RLS'yi etkinleştir
ALTER TABLE ogrenciler ENABLE ROW LEVEL SECURITY;
ALTER TABLE gunluk_cozum ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivation_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_statistics ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 8. GÜVENLİK POLİTİKALARI
-- ========================================

-- Öğrenciler politikaları
CREATE POLICY "Users can view own student data" ON ogrenciler
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own student data" ON ogrenciler
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view all students" ON ogrenciler
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ogrenciler 
      WHERE user_id = auth.uid() AND rol = 'koc'
    )
  );

-- Günlük çözüm politikaları
CREATE POLICY "Users can view own daily data" ON gunluk_cozum
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily data" ON gunluk_cozum
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily data" ON gunluk_cozum
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view student daily data" ON gunluk_cozum
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ogrenciler 
      WHERE user_id = auth.uid() AND rol = 'koc'
    )
  );

-- Mesajlaşma politikaları
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Gamification politikaları
CREATE POLICY "Users can view own gamification data" ON gamification_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification data" ON gamification_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification data" ON gamification_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Badge definitions herkes okuyabilir
CREATE POLICY "Anyone can view badge definitions" ON badge_definitions
  FOR SELECT USING (true);

-- Study plans politikaları
CREATE POLICY "Users can view own study plans" ON study_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study plans" ON study_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study plans" ON study_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Study sessions politikaları
CREATE POLICY "Users can view own study sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- User goals politikaları
CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Motivation data politikaları
CREATE POLICY "Users can view own motivation data" ON motivation_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own motivation data" ON motivation_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own motivation data" ON motivation_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Study statistics politikaları
CREATE POLICY "Users can view own study statistics" ON study_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study statistics" ON study_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study statistics" ON study_statistics
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- 9. TRIGGER FONKSİYONLARI
-- ========================================

-- updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 10. TRIGGER'LAR
-- ========================================

-- updated_at trigger'ları
CREATE TRIGGER update_ogrenciler_updated_at BEFORE UPDATE ON ogrenciler
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gunluk_cozum_updated_at BEFORE UPDATE ON gunluk_cozum
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamification_data_updated_at BEFORE UPDATE ON gamification_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motivation_data_updated_at BEFORE UPDATE ON motivation_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 11. YARDIMCI FONKSİYONLAR
-- ========================================

-- Varsayılan gamification verisi oluştur
CREATE OR REPLACE FUNCTION create_default_gamification_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO gamification_data (user_id, total_points, current_level, streak_days, badges_earned)
  VALUES (user_uuid, 0, 1, 0, '{}')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Varsayılan motivasyon verisi oluştur
CREATE OR REPLACE FUNCTION create_default_motivation_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO motivation_data (user_id, daily_motivation, personal_tips, study_reminders)
  VALUES (user_uuid, 'Bugün harika bir gün!', '{}', '[]')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Yeni kullanıcı kaydolduğunda otomatik veri oluşturma
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_gamification_data(NEW.id);
  PERFORM create_default_motivation_data(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- 12. VARSAYILAN VERİLER
-- ========================================

-- Varsayılan rozet tanımlarını ekle
INSERT INTO badge_definitions (badge_key, badge_name, badge_description, badge_icon, requirements, points_reward) VALUES
('turkce_master', 'Kitap Kurdu', '100 Türkçe sorusu çöz', '📚', '{"subject": "turkce", "total_questions": 100}', 50),
('math_master', 'Matematik Dehası', '500 matematik sorusu çöz', '🔢', '{"subject": "matematik", "total_questions": 500}', 100),
('streak_7', 'Ateş Gibi', '7 gün üst üste çalış', '🔥', '{"streak_days": 7}', 75),
('speed_demon', 'Hız Ustası', '1 günde 100 soru çöz', '⚡', '{"daily_questions": 100}', 100),
('accuracy_90', 'Keskin Nişancı', '%90 doğruluk oranına ulaş', '🎯', '{"accuracy_percentage": 90}', 150),
('level_10', 'Yıldız Öğrenci', 'Seviye 10''a ulaş', '🌟', '{"level": 10}', 200),
('fen_master', 'Fen Ustası', '300 Fen sorusu çöz', '🔬', '{"subject": "fen", "total_questions": 300}', 75),
('sosyal_master', 'Sosyal Bilimci', '200 Sosyal sorusu çöz', '🌍', '{"subject": "sosyal", "total_questions": 200}', 50),
('english_master', 'İngilizce Uzmanı', '150 İngilizce sorusu çöz', '🇬🇧', '{"subject": "ingilizce", "total_questions": 150}', 50),
('din_master', 'Din Bilgini', '100 Din sorusu çöz', '🕌', '{"subject": "din", "total_questions": 100}', 50)
ON CONFLICT (badge_key) DO NOTHING;

-- ========================================
-- VERİTABANI KURULUMU TAMAMLANDI!
-- ========================================
