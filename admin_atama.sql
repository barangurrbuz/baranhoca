-- ========================================
-- ADMIN/KOÇ ATAMA SİSTEMİ
-- ========================================

-- 1. MEVCUT KULLANICIYI KOÇ YAPMA
-- ========================================

-- Belirli bir kullanıcıyı koç yapmak için:
UPDATE ogrenciler 
SET rol = 'koc' 
WHERE user_id = 'KULLANICI_UUID_BURAYA';  -- Buraya kullanıcının UUID'sini yazın

-- Örnek: Email ile koç yapmak için:
UPDATE ogrenciler 
SET rol = 'koc' 
WHERE email = 'koc@example.com';

-- 2. TÜM KULLANICILARI LİSTELEME
-- ========================================

-- Tüm kullanıcıları ve rollerini görmek için:
SELECT 
  user_id,
  ad,
  soyad,
  email,
  rol,
  created_at
FROM ogrenciler 
ORDER BY created_at DESC;

-- 3. KOÇLARI LİSTELEME
-- ========================================

-- Sadece koçları görmek için:
SELECT 
  user_id,
  ad,
  soyad,
  email,
  created_at
FROM ogrenciler 
WHERE rol = 'koc'
ORDER BY created_at DESC;

-- 4. ÖĞRENCİLERİ LİSTELEME
-- ========================================

-- Sadece öğrencileri görmek için:
SELECT 
  user_id,
  ad,
  soyad,
  email,
  sinif,
  created_at
FROM ogrenciler 
WHERE rol = 'ogrenci'
ORDER BY created_at DESC;

-- 5. YENİ KOÇ EKLEME (MANUEL)
-- ========================================

-- Yeni bir koç eklemek için (auth.users tablosunda kullanıcı zaten varsa):
INSERT INTO ogrenciler (user_id, ad, soyad, rol, email)
VALUES (
  'YENİ_KULLANICI_UUID',  -- auth.users tablosundaki UUID
  'Koç Adı',
  'Koç Soyadı', 
  'koc',
  'koc@example.com'
);

-- 6. KOÇ ROLÜNÜ KALDIRMA
-- ========================================

-- Bir kullanıcının koç rolünü kaldırmak için:
UPDATE ogrenciler 
SET rol = 'ogrenci' 
WHERE user_id = 'KULLANICI_UUID_BURAYA';

-- 7. KULLANICI SİLME
-- ========================================

-- Bir kullanıcıyı tamamen silmek için:
DELETE FROM ogrenciler 
WHERE user_id = 'KULLANICI_UUID_BURAYA';

-- ========================================
-- KULLANIM TALİMATLARI
-- ========================================

-- 1. Supabase Dashboard'a gidin
-- 2. SQL Editor'ı açın
-- 3. Yukarıdaki komutlardan birini seçin
-- 4. KULLANICI_UUID_BURAYA kısmını gerçek UUID ile değiştirin
-- 5. Çalıştırın

-- UUID'yi bulmak için önce şu komutu çalıştırın:
-- SELECT user_id, ad, soyad, email FROM ogrenciler ORDER BY created_at DESC;
