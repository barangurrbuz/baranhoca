import { supabase } from './supabase.js';

let allUsers = [];

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAuth();
    await loadUsers();
    await loadStats();
    setupEventListeners();
});

// Admin yetkisi kontrolü
async function checkAdminAuth() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        alert('Lütfen giriş yapınız.');
        window.location.href = './login.html';
        return;
    }

    // Kullanıcının admin/koç olup olmadığını kontrol et
    const { data: userData, error: userError } = await supabase
        .from('ogrenciler')
        .select('rol')
        .eq('user_id', user.id)
        .single();

    if (userError || userData.rol !== 'koc') {
        alert('Bu sayfaya erişim yetkiniz yok. Sadece koçlar erişebilir.');
        window.location.href = './dashboard.html';
        return;
    }
}

// Tüm kullanıcıları yükle
async function loadUsers() {
    try {
        const { data, error } = await supabase
            .from('ogrenciler')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Kullanıcılar yüklenirken hata:', error);
            return;
        }

        allUsers = data;
        renderUsers(data);
    } catch (error) {
        console.error('Kullanıcı yükleme hatası:', error);
    }
}

// Kullanıcıları görüntüle
function renderUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    if (users.length === 0) {
        userList.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center;">Henüz kullanıcı bulunmuyor.</p>';
        return;
    }

    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        const isKoc = user.rol === 'koc';
        
        userItem.innerHTML = `
            <div class="user-info">
                <div class="user-name">${user.ad || 'İsimsiz'} ${user.soyad || ''}</div>
                <div class="user-email">${user.email || 'Email yok'}</div>
            </div>
            <div style="display: flex; align-items: center;">
                <span class="user-role role-${user.rol}">${isKoc ? 'Koç' : 'Öğrenci'}</span>
                ${!isKoc ? 
                    `<button class="role-btn btn-make-koc" onclick="makeKoc('${user.user_id}')">Koç Yap</button>` :
                    `<button class="role-btn btn-make-ogrenci" onclick="makeOgrenci('${user.user_id}')">Öğrenci Yap</button>`
                }
                <button class="role-btn btn-delete" onclick="deleteUser('${user.user_id}')">Sil</button>
            </div>
        `;
        
        userList.appendChild(userItem);
    });
}

// İstatistikleri yükle
async function loadStats() {
    try {
        const totalUsers = allUsers.length;
        const totalOgrenci = allUsers.filter(u => u.rol === 'ogrenci').length;
        const totalKoc = allUsers.filter(u => u.rol === 'koc').length;
        
        // Bugün aktif kullanıcı sayısı (son 24 saat)
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        const { data: activeUsers, error } = await supabase
            .from('gunluk_cozum')
            .select('user_id')
            .gte('created_at', yesterday.toISOString());
        
        const activeToday = error ? 0 : new Set(activeUsers.map(u => u.user_id)).size;

        document.getElementById('total-users').textContent = totalUsers;
        document.getElementById('total-ogrenci').textContent = totalOgrenci;
        document.getElementById('total-koc').textContent = totalKoc;
        document.getElementById('active-today').textContent = activeToday;
        
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
    }
}

// Event listener'ları ayarla
function setupEventListeners() {
    const searchBox = document.getElementById('user-search');
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredUsers = allUsers.filter(user => 
            (user.ad && user.ad.toLowerCase().includes(searchTerm)) ||
            (user.soyad && user.soyad.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm))
        );
        renderUsers(filteredUsers);
    });
}

// Kullanıcıyı koç yap
window.makeKoc = async function(userId) {
    if (!confirm('Bu kullanıcıyı koç yapmak istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('ogrenciler')
            .update({ rol: 'koc' })
            .eq('user_id', userId);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }

        alert('Kullanıcı başarıyla koç yapıldı!');
        await loadUsers();
        await loadStats();
    } catch (error) {
        console.error('Koç yapma hatası:', error);
        alert('Bir hata oluştu: ' + error.message);
    }
};

// Kullanıcıyı öğrenci yap
window.makeOgrenci = async function(userId) {
    if (!confirm('Bu kullanıcıyı öğrenci yapmak istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('ogrenciler')
            .update({ rol: 'ogrenci' })
            .eq('user_id', userId);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }

        alert('Kullanıcı başarıyla öğrenci yapıldı!');
        await loadUsers();
        await loadStats();
    } catch (error) {
        console.error('Öğrenci yapma hatası:', error);
        alert('Bir hata oluştu: ' + error.message);
    }
};

// Kullanıcıyı sil
window.deleteUser = async function(userId) {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('ogrenciler')
            .delete()
            .eq('user_id', userId);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }

        alert('Kullanıcı başarıyla silindi!');
        await loadUsers();
        await loadStats();
    } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
        alert('Bir hata oluştu: ' + error.message);
    }
};

// Kullanıcıları yenile
window.refreshUsers = async function() {
    await loadUsers();
    await loadStats();
    alert('Kullanıcılar yenilendi!');
};
