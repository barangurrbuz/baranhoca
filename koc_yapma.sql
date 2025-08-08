-- ========================================
-- KULLANICIYI KOÇ YAPMA
-- ========================================

-- 1. ÖNCE KULLANICILARI LİSTELE
-- ========================================
-- Bu sorguyu çalıştırın ve kendi bilgilerinizi bulun:

SELECT 
  user_id,
  ad,
  soyad,
  email,
  rol,
  created_at
FROM ogrenciler 
ORDER BY created_at DESC;

-- ========================================
-- 2. KENDİNİZİ KOÇ YAPIN
-- ========================================

-- YÖNTEM A: Email ile (en kolay)
-- Aşağıdaki sorguda SİZİN_EMAIL_ADRESİNİZ kısmını kendi email'inizle değiştirin:

UPDATE ogrenciler 
SET rol = 'koc' 
WHERE email = 'SİZİN_EMAIL_ADRESİNİZ';

-- YÖNTEM B: User ID ile
-- Yukarıdaki listeden kendi user_id'nizi alın ve aşağıdaki sorguda değiştirin:

-- UPDATE ogrenciler 
-- SET rol = 'koc' 
-- WHERE user_id = 'SİZİN_USER_ID';

-- ========================================
-- 3. KONTROL EDİN
-- ========================================
-- Koç yapıldıktan sonra kontrol etmek için:

SELECT 
  user_id,
  ad,
  soyad,
  email,
  rol,
  created_at
FROM ogrenciler 
WHERE rol = 'koc'
ORDER BY created_at DESC;

-- ========================================
-- TALİMATLAR
-- ========================================
-- 1. Supabase Dashboard → SQL Editor
-- 2. İlk sorguyu çalıştırın (kullanıcıları listele)
-- 3. Kendi bilgilerinizi bulun
-- 4. İkinci sorguyu çalıştırın (koç yap)
-- 5. Üçüncü sorguyu çalıştırın (kontrol et)
-- 6. Dashboard'a gidin ve "⚙️ Admin Paneli" butonunu görün
