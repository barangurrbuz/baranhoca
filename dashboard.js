import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Kullanıcı kontrolü
  async function checkAuth() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      alert('Lütfen giriş yapınız.');
      window.location.href = './login.html';
      return null;
    }
    return user;
  }

  // Kullanıcı rolünü ve ismini almak
  async function getUserRole(user) {
    const { data, error } = await supabase
      .from('ogrenciler')
      .select('rol, ad, soyad')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.warn('Rol veya kullanıcı bilgisi alınamadı, varsayılan öğrenci rolü atanıyor.');
      return { rol: 'ogrenci', ad: null, soyad: null };
    }
    return data;
  }

  // Kullanıcı adını göster
  function showUserName(ad, soyad) {
    const el = document.getElementById('user-name');
    if (!ad || !soyad) {
      el.textContent = 'Öğrenci';
    } else {
      el.textContent = `${ad} ${soyad}`;
    }
  }

  // Haftalık verileri getir (son 7 gün) - öğrenci için
  async function fetchWeeklyData(user) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const isoDate = sevenDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('gunluk_cozum')
      .select('*')
      .eq('user_id', user.id)
      .gte('tarih', isoDate)
      .order('tarih', { ascending: true });

    if (error) {
      console.error('Veri alınamadı:', error);
      return [];
    }
    return data;
  }

  // Haftalık verileri getir - koç için seçilen öğrenci
  async function fetchWeeklyDataByUserId(user_id) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const isoDate = sevenDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('gunluk_cozum')
      .select('*')
      .eq('user_id', user_id)
      .gte('tarih', isoDate)
      .order('tarih', { ascending: true });

    if (error) {
      console.error('Veri alınamadı:', error);
      return [];
    }
    return data;
  }

  // Haftalık özet hesapla ve ekrana yazdır
  function updateWeeklySummary(data) {
    if (!data.length) {
      document.getElementById('haftalik-dogru').textContent = '0';
      document.getElementById('haftalik-yanlis').textContent = '0';
      document.getElementById('en-cok-ders').textContent = '-';
      document.getElementById('en-az-ders').textContent = '-';
      return;
    }

    const dersler = ['turkce', 'matematik', 'fen', 'sosyal', 'ingilizce', 'din'];

    const dersDogruToplam = {};
    dersler.forEach(ders => dersDogruToplam[ders] = 0);

    data.forEach(gunluk => {
      dersler.forEach(ders => {
        dersDogruToplam[ders] += gunluk[`${ders}_dogru`] ?? 0;
      });
    });

    const toplamDogru = Object.values(dersDogruToplam).reduce((a, b) => a + b, 0);

    // Yanlış toplamını da hesapla
    const dersYanlisToplam = {};
    dersler.forEach(ders => dersYanlisToplam[ders] = 0);

    data.forEach(gunluk => {
      dersler.forEach(ders => {
        dersYanlisToplam[ders] += gunluk[`${ders}_yanlis`] ?? 0;
      });
    });

    const toplamYanlis = Object.values(dersYanlisToplam).reduce((a, b) => a + b, 0);

    // En çok ve en az çalışılan dersler (doğru üzerinden)
    const enCokDers = Object.entries(dersDogruToplam).reduce((a, b) => (b[1] > a[1] ? b : a));
    const enAzDers = Object.entries(dersDogruToplam).reduce((a, b) => (b[1] < a[1] ? b : a));

    document.getElementById('haftalik-dogru').textContent = toplamDogru;
    document.getElementById('haftalik-yanlis').textContent = toplamYanlis;
    document.getElementById('en-cok-ders').textContent = enCokDers[0].charAt(0).toUpperCase() + enCokDers[0].slice(1);
    document.getElementById('en-az-ders').textContent = enAzDers[0].charAt(0).toUpperCase() + enAzDers[0].slice(1);
  }

  // Grafik oluşturucu - Bar (Doğru)
  function createBarChart(ctx, labels, datasets) {
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#2980b9' } } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Doğru Sayısı', color: '#27ae60' }, ticks: { color: '#333' } },
          x: { title: { display: true, text: 'Tarih', color: '#333' }, ticks: { color: '#333' } }
        }
      }
    });
  }

  // Grafik oluşturucu - Line (Yanlış)
  function createLineChart(ctx, labels, datasets) {
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#e74c3c' } } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Yanlış Sayısı', color: '#e74c3c' }, ticks: { color: '#333' } },
          x: { title: { display: true, text: 'Tarih', color: '#333' }, ticks: { color: '#333' } }
        }
      }
    });
  }

  // Öğrenci için grafik çiz
  async function renderCharts(user) {
    const data = await fetchWeeklyData(user);
    if (!data.length) return;

    updateWeeklySummary(data);

    const labels = data.map(d => new Date(d.tarih).toLocaleDateString('tr-TR'));
    const dersler = ['turkce', 'matematik', 'fen', 'sosyal', 'ingilizce', 'din'];

    const dogruDatasets = dersler.map((ders, i) => ({
      label: ders.charAt(0).toUpperCase() + ders.slice(1),
      data: data.map(d => d[`${ders}_dogru`] ?? 0),
      backgroundColor: ['#27ae60', '#2ecc71', '#1abc9c', '#16a085', '#3498db', '#2980b9'][i],
    }));

    const yanlisDatasets = dersler.map((ders, i) => ({
      label: ders.charAt(0).toUpperCase() + ders.slice(1),
      data: data.map(d => d[`${ders}_yanlis`] ?? 0),
      borderColor: ['#e74c3c', '#c0392b', '#e67e22', '#d35400', '#e74c3c', '#c0392b'][i],
      backgroundColor: 'rgba(231, 76, 60, 0.3)',
      fill: true,
      tension: 0.3,
      pointRadius: 4
    }));

    if (window.dogruChart) window.dogruChart.destroy();
    if (window.yanlisChart) window.yanlisChart.destroy();

    const dogruCtx = document.getElementById('dogruChart').getContext('2d');
    const yanlisCtx = document.getElementById('yanlisChart').getContext('2d');

    window.dogruChart = createBarChart(dogruCtx, labels, dogruDatasets);
    window.yanlisChart = createLineChart(yanlisCtx, labels, yanlisDatasets);
  }

  // Formdaki input değerini al (sayı)
  function getInputValue(id) {
    const input = document.getElementById(id);
    if (!input) {
      console.warn('Input bulunamadı: ' + id);
      return 0;
    }
    return parseInt(input.value, 10) || 0;
  }

  // Öğrenci günlük verisini kaydet
  async function saveDailyData(user) {
    const form = document.getElementById('daily-form');
    if (!form) {
      console.error('Form bulunamadı: daily-form');
      return;
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const dataToInsert = {
        user_id: user.id,
        tarih: new Date().toISOString().split('T')[0],
        turkce_dogru: getInputValue('turkce-dogru'),
        turkce_yanlis: getInputValue('turkce-yanlis'),
        matematik_dogru: getInputValue('matematik-dogru'),
        matematik_yanlis: getInputValue('matematik-yanlis'),
        fen_dogru: getInputValue('fen-dogru'),
        fen_yanlis: getInputValue('fen-yanlis'),
        sosyal_dogru: getInputValue('sosyal-dogru'),
        sosyal_yanlis: getInputValue('sosyal-yanlis'),
        ingilizce_dogru: getInputValue('ingilizce-dogru'),
        ingilizce_yanlis: getInputValue('ingilizce-yanlis'),
        din_dogru: getInputValue('din-dogru'),
        din_yanlis: getInputValue('din-yanlis'),
      };

      const { error } = await supabase
        .from('gunluk_cozum')
        .upsert(dataToInsert, { onConflict: ['user_id', 'tarih'] });

      if (error) {
        alert('Veri kaydedilirken hata oluştu: ' + error.message);
      } else {
        alert('Veriler başarıyla kaydedildi!');
        renderCharts(user);
      }
    });
  }

  // Koç paneli için öğrenci listesini al
  async function fetchOgrenciler() {
    const { data, error } = await supabase
      .from('ogrenciler')
      .select('user_id, ad, soyad')
      .order('ad', { ascending: true });

    if (error) {
      console.error('Öğrenci listesi alınamadı:', error);
      return [];
    }
    return data;
  }

  // Koç paneli için seçilen öğrencinin verilerini çek ve grafik çiz
  async function handleOgrenciSecim(user_id) {
    if (!user_id) {
      if (window.kocDogruChart) window.kocDogruChart.destroy();
      if (window.kocYanlisChart) window.kocYanlisChart.destroy();
      return;
    }

    const data = await fetchWeeklyDataByUserId(user_id);

    if (!data.length) {
      alert('Seçilen öğrencinin son 7 güne ait verisi bulunamadı.');
      if (window.kocDogruChart) window.kocDogruChart.destroy();
      if (window.kocYanlisChart) window.kocYanlisChart.destroy();
      return;
    }

    updateWeeklySummary(data);

    const labels = data.map(d => new Date(d.tarih).toLocaleDateString('tr-TR'));
    const dersler = ['turkce', 'matematik', 'fen', 'sosyal', 'ingilizce', 'din'];

    const dogruDatasets = dersler.map((ders, i) => ({
      label: ders.charAt(0).toUpperCase() + ders.slice(1),
      data: data.map(d => d[`${ders}_dogru`] ?? 0),
      backgroundColor: ['#27ae60', '#2ecc71', '#1abc9c', '#16a085', '#3498db', '#2980b9'][i],
    }));

    const yanlisDatasets = dersler.map((ders, i) => ({
      label: ders.charAt(0).toUpperCase() + ders.slice(1),
      data: data.map(d => d[`${ders}_yanlis`] ?? 0),
      borderColor: ['#e74c3c', '#c0392b', '#e67e22', '#d35400', '#e74c3c', '#c0392b'][i],
      backgroundColor: 'rgba(231, 76, 60, 0.3)',
      fill: true,
      tension: 0.3,
      pointRadius: 4
    }));

    if (window.kocDogruChart) window.kocDogruChart.destroy();
    if (window.kocYanlisChart) window.kocYanlisChart.destroy();

    const dogruCtx = document.getElementById('koc-dogruChart').getContext('2d');
    const yanlisCtx = document.getElementById('koc-yanlisChart').getContext('2d');

    window.kocDogruChart = createBarChart(dogruCtx, labels, dogruDatasets);
    window.kocYanlisChart = createLineChart(yanlisCtx, labels, yanlisDatasets);
  }

  // Ana işleyiş
  const user = await checkAuth();
  if (!user) return;

  const userInfo = await getUserRole(user);
  showUserName(userInfo.ad, userInfo.soyad);

  if (userInfo.rol === 'koc') {
    document.getElementById('koc-panel').style.display = 'block';
    document.getElementById('admin-btn').style.display = 'inline-block';

    const ogrenciSelect = document.getElementById('ogrenci-secim');
    const ogrenciler = await fetchOgrenciler();

    ogrenciler.forEach(o => {
      const option = document.createElement('option');
      option.value = o.user_id;
      option.textContent = `${o.ad} ${o.soyad}`;
      ogrenciSelect.appendChild(option);
    });

    ogrenciSelect.addEventListener('change', (e) => {
      handleOgrenciSecim(e.target.value);
    });

  } else {
    const data = await fetchWeeklyData(user);
    updateWeeklySummary(data);
    await renderCharts(user);
    saveDailyData(user);
  }

  // Çıkış butonu
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = './login.html';
    });
  }
});
