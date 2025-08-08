import { supabase } from './supabase.js';

// Gamification verilerini yükle
export async function loadGamificationData(userId) {
  try {
    const { data, error } = await supabase
      .from('gamification_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Gamification verisi yüklenirken hata:', error);
      return createDefaultGamificationData(userId);
    }

    if (!data) {
      return createDefaultGamificationData(userId);
    }

    return data;
  } catch (error) {
    console.error('Gamification verisi yüklenirken hata:', error);
    return createDefaultGamificationData(userId);
  }
}

// Varsayılan gamification verisi oluştur
async function createDefaultGamificationData(userId) {
  const defaultData = {
    user_id: userId,
    total_points: 0,
    current_level: 1,
    streak_days: 0,
    badges_earned: [],
    last_study_date: null,
    weekly_goals: {
      questions_target: 100,
      study_hours_target: 10,
      accuracy_target: 80
    },
    daily_challenges: {
      completed: [],
      in_progress: [],
      locked: []
    }
  };

  const { data, error } = await supabase
    .from('gamification_data')
    .insert(defaultData)
    .select()
    .single();

  if (error) {
    console.error('Varsayılan gamification verisi oluşturulurken hata:', error);
    return defaultData;
  }

  return data;
}

// Puanları güncelle
export async function updatePoints(userId, pointsToAdd) {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('gamification_data')
      .select('total_points, current_level')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Mevcut puanlar alınırken hata:', fetchError);
      return false;
    }

    const newTotalPoints = (currentData.total_points || 0) + pointsToAdd;
    const newLevel = calculateLevel(newTotalPoints);

    const { error: updateError } = await supabase
      .from('gamification_data')
      .update({
        total_points: newTotalPoints,
        current_level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Puanlar güncellenirken hata:', updateError);
      return false;
    }

    // Seviye atladıysa bildirim göster
    if (newLevel > currentData.current_level) {
      showLevelUpNotification(newLevel);
    }

    return true;
  } catch (error) {
    console.error('Puan güncelleme hatası:', error);
    return false;
  }
}

// Seviye hesapla
function calculateLevel(totalPoints) {
  const levels = [
    { level: 1, points: 0 },
    { level: 2, points: 100 },
    { level: 3, points: 300 },
    { level: 4, points: 600 },
    { level: 5, points: 1000 },
    { level: 6, points: 1500 },
    { level: 7, points: 2100 },
    { level: 8, points: 2800 },
    { level: 9, points: 3600 },
    { level: 10, points: 4500 }
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].points) {
      return levels[i].level;
    }
  }

  return 1;
}

// Çalışma serisini güncelle
export async function updateStreak(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: currentData, error: fetchError } = await supabase
      .from('gamification_data')
      .select('streak_days, last_study_date')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Seri verisi alınırken hata:', fetchError);
      return false;
    }

    let newStreak = currentData.streak_days || 0;
    const lastStudyDate = currentData.last_study_date;

    if (lastStudyDate) {
      const lastDate = new Date(lastStudyDate);
      const todayDate = new Date(today);
      const diffTime = todayDate - lastDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Üst üste çalışma
        newStreak++;
      } else if (diffDays > 1) {
        // Seri kırıldı
        newStreak = 1;
      }
      // diffDays === 0 ise bugün zaten çalışmış
    } else {
      // İlk kez çalışıyor
      newStreak = 1;
    }

    const { error: updateError } = await supabase
      .from('gamification_data')
      .update({
        streak_days: newStreak,
        last_study_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Seri güncellenirken hata:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Seri güncelleme hatası:', error);
    return false;
  }
}

// Rozet kazanma
export async function unlockBadge(userId, badgeKey, badgeName) {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('gamification_data')
      .select('badges_earned')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Rozet verisi alınırken hata:', fetchError);
      return false;
    }

    const currentBadges = currentData.badges_earned || [];
    
    // Rozet zaten kazanılmış mı kontrol et
    if (currentBadges.includes(badgeKey)) {
      return true; // Zaten kazanılmış
    }

    // Yeni rozeti ekle
    const newBadges = [...currentBadges, badgeKey];

    const { error: updateError } = await supabase
      .from('gamification_data')
      .update({
        badges_earned: newBadges,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Rozet güncellenirken hata:', updateError);
      return false;
    }

    // Rozet kazanma bildirimi göster
    showBadgeUnlockedNotification(badgeName);
    return true;
  } catch (error) {
    console.error('Rozet kazanma hatası:', error);
    return false;
  }
}

// Günlük görevleri güncelle
export async function updateDailyChallenges(userId, challenges) {
  try {
    const { error } = await supabase
      .from('gamification_data')
      .update({
        daily_challenges: challenges,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Günlük görevler güncellenirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Günlük görev güncelleme hatası:', error);
    return false;
  }
}

// Haftalık hedefleri güncelle
export async function updateWeeklyGoals(userId, goals) {
  try {
    const { error } = await supabase
      .from('gamification_data')
      .update({
        weekly_goals: goals,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Haftalık hedefler güncellenirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Haftalık hedef güncelleme hatası:', error);
    return false;
  }
}

// Bildirim fonksiyonları
function showLevelUpNotification(newLevel) {
  const levelNames = {
    1: 'Bronz',
    2: 'Bronz',
    3: 'Gümüş',
    4: 'Gümüş',
    5: 'Altın',
    6: 'Altın',
    7: 'Altın',
    8: 'Platin',
    9: 'Platin',
    10: 'Elmas'
  };

  const notification = document.createElement('div');
  notification.className = 'level-up-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <h3>🎉 Seviye Atladın!</h3>
      <p>Seviye ${newLevel} - ${levelNames[newLevel]} Öğrenci oldun!</p>
    </div>
  `;

  document.body.appendChild(notification);

  // 3 saniye sonra kaldır
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showBadgeUnlockedNotification(badgeName) {
  const notification = document.createElement('div');
  notification.className = 'badge-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <h3>🏅 Yeni Rozet Kazandın!</h3>
      <p>${badgeName} rozetini kazandın!</p>
    </div>
  `;

  document.body.appendChild(notification);

  // 3 saniye sonra kaldır
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// CSS stilleri ekle
const style = document.createElement('style');
style.textContent = `
  .level-up-notification,
  .badge-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: slideIn 0.5s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .notification-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }

  .notification-content p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;
document.head.appendChild(style);
