import { supabase } from './supabase.js';

// Giriş işlemi
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Giriş başarısız: ' + error.message);
    } else {
      window.location.href = './dashboard.html';
    }
  });
}

// Kayıt işlemi
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ad = document.getElementById('ad').value.trim();
    const soyad = document.getElementById('soyad').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert('Kayıt başarısız: ' + error.message);
      return;
    }

    // Kullanıcı kaydı başarılı, ek bilgileri 'ogrenciler' tablosuna ekle
    const user = data.user;
    if (!user) {
      alert('Kullanıcı oluşturulamadı!');
      return;
    }

    const { error: insertError } = await supabase
      .from('ogrenciler')
      .insert([
        { user_id: user.id, ad, soyad, rol: 'ogrenci' }
      ]);

    if (insertError) {
      alert('Profil bilgileri kaydedilemedi: ' + insertError.message);
      return;
    }

    alert('Kayıt başarılı! Lütfen giriş yapınız.');
    window.location.href = './login.html';
  });
}
