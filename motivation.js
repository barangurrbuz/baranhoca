import { supabase } from './supabase.js';

// Motivasyon verilerini yükle
export async function loadMotivationData(userId) {
  try {
    const { data, error } = await supabase
      .from('motivation_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Motivasyon verisi yüklenirken hata:', error);
      return createDefaultMotivationData(userId);
    }

    if (!data) {
      return createDefaultMotivationData(userId);
    }

    return data;
  } catch (error) {
    console.error('Motivasyon verisi yüklenirken hata:', error);
    return createDefaultMotivationData(userId);
  }
}

// Varsayılan motivasyon verisi oluştur
async function createDefaultMotivationData(userId) {
  const defaultData = {
    user_id: userId,
    daily_motivation: 'Bugün harika bir gün! Sen yapabilirsin!',
    personal_tips: {
      study_tips: [
        'Kısa molalar vererek çalış, bu beynini dinlendirir',
        'Zor konuları sabah saatlerinde çalış',
        'Her gün en az 30 dakika tekrar yap',
        'Hedeflerini küçük parçalara böl'
      ],
      motivation_tips: [
        'Her başarısızlık bir öğrenme fırsatıdır',
        'Kendine inan, sen başarabilirsin',
        'Küçük ilerlemeler büyük başarıların temelidir',
        'Bugün yapabileceğin en iyi şeyi yap'
      ]
    },
    study_reminders: [
      {
        id: 1,
        text: 'Matematik çalışma zamanı!',
        time: '09:00',
        days: ['monday', 'wednesday', 'friday'],
        active: true
      },
      {
        id: 2,
        text: 'Türkçe tekrar yapma zamanı!',
        time: '14:00',
        days: ['tuesday', 'thursday', 'saturday'],
        active: true
      },
      {
        id: 3,
        text: 'Fen bilimleri çalışma zamanı!',
        time: '16:00',
        days: ['monday', 'thursday', 'saturday'],
        active: true
      }
    ],
    favorite_quotes: [
      'Başarı bir yolculuktur, varış noktası değil.',
      'Her yeni gün yeni bir fırsattır.',
      'Kendine inan, çünkü sen yapabilirsin!',
      'Çalışmak başarının anahtarıdır.',
      'Hedeflerine odaklan ve asla vazgeçme.'
    ]
  };

  const { data, error } = await supabase
    .from('motivation_data')
    .insert(defaultData)
    .select()
    .single();

  if (error) {
    console.error('Varsayılan motivasyon verisi oluşturulurken hata:', error);
    return defaultData;
  }

  return data;
}

// Günlük motivasyon mesajını güncelle
export async function updateDailyMotivation(userId, motivation) {
  try {
    const { error } = await supabase
      .from('motivation_data')
      .update({
        daily_motivation: motivation,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Günlük motivasyon güncellenirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Günlük motivasyon güncelleme hatası:', error);
    return false;
  }
}

// Kişisel ipuçlarını güncelle
export async function updatePersonalTips(userId, tips) {
  try {
    const { error } = await supabase
      .from('motivation_data')
      .update({
        personal_tips: tips,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Kişisel ipuçları güncellenirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Kişisel ipuçları güncelleme hatası:', error);
    return false;
  }
}

// Çalışma hatırlatıcısı ekle
export async function addStudyReminder(userId, reminder) {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('motivation_data')
      .select('study_reminders')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Mevcut hatırlatıcılar alınırken hata:', fetchError);
      return false;
    }

    const currentReminders = currentData.study_reminders || [];
    const newReminder = {
      id: Date.now(), // Basit ID oluşturma
      ...reminder,
      active: true
    };

    const updatedReminders = [...currentReminders, newReminder];

    const { error: updateError } = await supabase
      .from('motivation_data')
      .update({
        study_reminders: updatedReminders,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Hatırlatıcı eklenirken hata:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Hatırlatıcı ekleme hatası:', error);
    return false;
  }
}

// Çalışma hatırlatıcısını güncelle
export async function updateStudyReminder(userId, reminderId, updates) {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('motivation_data')
      .select('study_reminders')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Mevcut hatırlatıcılar alınırken hata:', fetchError);
      return false;
    }

    const currentReminders = currentData.study_reminders || [];
    const updatedReminders = currentReminders.map(reminder => 
      reminder.id === reminderId ? { ...reminder, ...updates } : reminder
    );

    const { error: updateError } = await supabase
      .from('motivation_data')
      .update({
        study_reminders: updatedReminders,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Hatırlatıcı güncellenirken hata:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Hatırlatıcı güncelleme hatası:', error);
    return false;
  }
}

// Çalışma hatırlatıcısını sil
export async function deleteStudyReminder(userId, reminderId) {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('motivation_data')
      .select('study_reminders')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Mevcut hatırlatıcılar alınırken hata:', fetchError);
      return false;
    }

    const currentReminders = currentData.study_reminders || [];
    const updatedReminders = currentReminders.filter(reminder => reminder.id !== reminderId);

    const { error: updateError } = await supabase
      .from('motivation_data')
      .update({
        study_reminders: updatedReminders,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Hatırlatıcı silinirken hata:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Hatırlatıcı silme hatası:', error);
    return false;
  }
}

// Favori alıntı ekle
export async function addFavoriteQuote(userId, quote) {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('motivation_data')
      .select('favorite_quotes')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Mevcut alıntılar alınırken hata:', fetchError);
      return false;
    }

    const currentQuotes = currentData.favorite_quotes || [];
    const updatedQuotes = [...currentQuotes, quote];

    const { error: updateError } = await supabase
      .from('motivation_data')
      .update({
        favorite_quotes: updatedQuotes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Alıntı eklenirken hata:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Alıntı ekleme hatası:', error);
    return false;
  }
}

// Favori alıntı sil
export async function removeFavoriteQuote(userId, quote) {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('motivation_data')
      .select('favorite_quotes')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Mevcut alıntılar alınırken hata:', fetchError);
      return false;
    }

    const currentQuotes = currentData.favorite_quotes || [];
    const updatedQuotes = currentQuotes.filter(q => q !== quote);

    const { error: updateError } = await supabase
      .from('motivation_data')
      .update({
        favorite_quotes: updatedQuotes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Alıntı silinirken hata:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Alıntı silme hatası:', error);
    return false;
  }
}

// Rastgele motivasyon mesajı al
export function getRandomMotivationMessage() {
  const messages = [
    "Her başarısızlık, başarıya giden yolda bir adımdır. Bugün kendine inan ve devam et!",
    "Küçük ilerlemeler büyük başarıların temelidir. Her gün bir adım at!",
    "Zorluklar seni güçlendirir. Bugün zor olan yarın kolay olacak!",
    "Başarı bir yolculuktur, varış noktası değil. Her gün öğrenmeye devam et!",
    "Kendine inan, çünkü sen yapabilirsin! Bugün harika bir gün olacak!",
    "Her yeni gün yeni bir fırsattır. Bugünü en iyi şekilde değerlendir!",
    "Çalışmak başarının anahtarıdır. Bugün çok çalış, yarın başar!",
    "Hedeflerine odaklan ve asla vazgeçme. Sen başarabilirsin!",
    "Her soru çözdüğünde bir adım daha ilerliyorsun. Devam et!",
    "Bugünün çabası yarının başarısıdır. Çalışmaya devam et!",
    "Başarı merdivenini tek tek çık, her adım önemlidir!",
    "Kendine güven, çünkü sen harika bir öğrencisin!",
    "Bugün yapabileceğin en iyi şeyi yap, yarın daha da iyisini yaparsın!",
    "Her zorluk seni daha güçlü yapar. Devam et!",
    "Başarı yolculuğunda sabırlı ol, sonuçlar gelir!"
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

// Başarı hikayeleri
export function getSuccessStories() {
  return [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      achievement: "LGS'de %1'lik dilime girdi",
      story: "Günde 3 saat düzenli çalışarak ve hedeflerime odaklanarak başardım. Her gün küçük adımlar atmak çok önemli!",
      avatar: "👨‍🎓"
    },
    {
      id: 2,
      name: "Zeynep Kaya",
      achievement: "Matematik sınavında 100 aldı",
      story: "Matematikte zorlanıyordum ama her gün 20 soru çözerek ve konuları tekrar ederek başardım. Asla vazgeçme!",
      avatar: "👩‍🎓"
    },
    {
      id: 3,
      name: "Mehmet Demir",
      achievement: "7 gün üst üste çalıştı",
      story: "İlk başta zordu ama her gün biraz daha kolaylaştı. Şimdi çalışmak benim için bir alışkanlık oldu!",
      avatar: "👨‍🎓"
    },
    {
      id: 4,
      name: "Elif Özkan",
      achievement: "Türkçe'de %95 başarı oranı",
      story: "Kitap okumayı alışkanlık haline getirdim ve her gün en az 30 dakika Türkçe çalıştım. Sonuçlar harika!",
      avatar: "👩‍🎓"
    },
    {
      id: 5,
      name: "Can Arslan",
      achievement: "Fen bilimlerinde seviye atladı",
      story: "Deneyler yaparak ve konuları görselleştirerek öğrendim. Fen artık en sevdiğim ders!",
      avatar: "👨‍🎓"
    }
  ];
}

// Kişiselleştirilmiş ipuçları oluştur
export function generatePersonalizedTips(userPerformance) {
  const tips = {
    study_tips: [],
    motivation_tips: []
  };

  // En zayıf dersi bul
  let weakestSubject = '';
  let lowestScore = 100;

  Object.keys(userPerformance).forEach(subject => {
    const performance = userPerformance[subject];
    if (performance.score < lowestScore) {
      lowestScore = performance.score;
      weakestSubject = subject;
    }
  });

  // Zayıf ders için özel ipuçları
  if (weakestSubject) {
    const subjectNames = {
      'turkce': 'Türkçe',
      'matematik': 'Matematik',
      'fen': 'Fen Bilimleri',
      'sosyal': 'Sosyal Bilgiler',
      'ingilizce': 'İngilizce',
      'din': 'Din Kültürü'
    };

    tips.study_tips.push(
      `${subjectNames[weakestSubject]} dersinde zorlanıyorsun. Bu derse daha fazla zaman ayırmayı dene!`,
      `${subjectNames[weakestSubject]} konularını küçük parçalara bölerek çalış.`,
      `${subjectNames[weakestSubject]} için günlük 30 dakika tekrar yap.`
    );
  }

  // Genel çalışma ipuçları
  tips.study_tips.push(
    'Kısa molalar vererek çalış, bu beynini dinlendirir',
    'Zor konuları sabah saatlerinde çalış',
    'Her gün en az 30 dakika tekrar yap',
    'Hedeflerini küçük parçalara böl'
  );

  // Motivasyon ipuçları
  tips.motivation_tips.push(
    'Her başarısızlık bir öğrenme fırsatıdır',
    'Kendine inan, sen başarabilirsin',
    'Küçük ilerlemeler büyük başarıların temelidir',
    'Bugün yapabileceğin en iyi şeyi yap'
  );

  return tips;
}

// Hatırlatıcı kontrolü
export function checkReminders(reminders) {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });

  return reminders.filter(reminder => {
    return reminder.active && 
           reminder.time === currentTime && 
           reminder.days.includes(currentDay);
  });
}

// Motivasyon seviyesi hesapla
export function calculateMotivationLevel(userData) {
  let score = 0;

  // Çalışma süresi
  if (userData.study_time_minutes > 120) score += 20;
  else if (userData.study_time_minutes > 60) score += 15;
  else if (userData.study_time_minutes > 30) score += 10;

  // Doğruluk oranı
  if (userData.accuracy_percentage > 90) score += 25;
  else if (userData.accuracy_percentage > 80) score += 20;
  else if (userData.accuracy_percentage > 70) score += 15;

  // Çalışma serisi
  if (userData.streak_days > 7) score += 25;
  else if (userData.streak_days > 3) score += 20;
  else if (userData.streak_days > 1) score += 15;

  // Hedef tamamlama
  if (userData.goals_completed > 5) score += 30;
  else if (userData.goals_completed > 3) score += 20;
  else if (userData.goals_completed > 1) score += 10;

  // Motivasyon seviyesi belirleme
  if (score >= 80) return { level: 'Yüksek', emoji: '🚀', message: 'Harika gidiyorsun! Bu tempoyu koru!' };
  else if (score >= 60) return { level: 'Orta', emoji: '💪', message: 'İyi gidiyorsun! Biraz daha çaba göster!' };
  else if (score >= 40) return { level: 'Düşük', emoji: '📈', message: 'Başlamak için hiç geç değil! Bugün başla!' };
  else return { level: 'Çok Düşük', emoji: '🌟', message: 'Her başarı bir adımla başlar. Sen yapabilirsin!' };
}

