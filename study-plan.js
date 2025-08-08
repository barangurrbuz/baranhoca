import { supabase } from './supabase.js';

// Çalışma planı verilerini yükle
export async function loadStudyPlan(userId, weekStart) {
  try {
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Çalışma planı yüklenirken hata:', error);
      return createDefaultStudyPlan(userId, weekStart);
    }

    if (!data) {
      return createDefaultStudyPlan(userId, weekStart);
    }

    return data;
  } catch (error) {
    console.error('Çalışma planı yüklenirken hata:', error);
    return createDefaultStudyPlan(userId, weekStart);
  }
}

// Varsayılan çalışma planı oluştur
async function createDefaultStudyPlan(userId, weekStart) {
  const defaultPlan = {
    user_id: userId,
    week_start: weekStart,
    daily_goals: {
      monday: {
        subjects: ['matematik', 'turkce'],
        tasks: [
          { id: 1, text: 'Matematik 20 soru çöz', completed: false },
          { id: 2, text: 'Türkçe 15 soru çöz', completed: false }
        ],
        study_time: 120
      },
      tuesday: {
        subjects: ['fen', 'sosyal'],
        tasks: [
          { id: 3, text: 'Fen 15 soru çöz', completed: false },
          { id: 4, text: 'Sosyal 10 soru çöz', completed: false }
        ],
        study_time: 90
      },
      wednesday: {
        subjects: ['ingilizce', 'din'],
        tasks: [
          { id: 5, text: 'İngilizce 10 soru çöz', completed: false },
          { id: 6, text: 'Din 5 soru çöz', completed: false }
        ],
        study_time: 60
      },
      thursday: {
        subjects: ['matematik', 'fen'],
        tasks: [
          { id: 7, text: 'Matematik 25 soru çöz', completed: false },
          { id: 8, text: 'Fen 20 soru çöz', completed: false }
        ],
        study_time: 150
      },
      friday: {
        subjects: ['turkce', 'sosyal'],
        tasks: [
          { id: 9, text: 'Türkçe 20 soru çöz', completed: false },
          { id: 10, text: 'Sosyal 15 soru çöz', completed: false }
        ],
        study_time: 120
      },
      saturday: {
        subjects: ['ingilizce', 'din'],
        tasks: [
          { id: 11, text: 'İngilizce 15 soru çöz', completed: false },
          { id: 12, text: 'Din 10 soru çöz', completed: false }
        ],
        study_time: 90
      },
      sunday: {
        subjects: ['genel'],
        tasks: [
          { id: 13, text: 'Haftalık tekrar yap', completed: false },
          { id: 14, text: 'Eksik konuları tamamla', completed: false }
        ],
        study_time: 60
      }
    },
    completed_tasks: {},
    study_time_minutes: 0
  };

  const { data, error } = await supabase
    .from('study_plans')
    .insert(defaultPlan)
    .select()
    .single();

  if (error) {
    console.error('Varsayılan çalışma planı oluşturulurken hata:', error);
    return defaultPlan;
  }

  return data;
}

// Çalışma planını güncelle
export async function updateStudyPlan(userId, weekStart, planData) {
  try {
    const { error } = await supabase
      .from('study_plans')
      .upsert({
        user_id: userId,
        week_start: weekStart,
        daily_goals: planData.daily_goals,
        completed_tasks: planData.completed_tasks,
        study_time_minutes: planData.study_time_minutes,
        updated_at: new Date().toISOString()
      }, { onConflict: ['user_id', 'week_start'] });

    if (error) {
      console.error('Çalışma planı güncellenirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Çalışma planı güncelleme hatası:', error);
    return false;
  }
}

// Görev tamamla
export async function completeTask(userId, weekStart, day, taskId) {
  try {
    const { data: currentPlan, error: fetchError } = await supabase
      .from('study_plans')
      .select('daily_goals, completed_tasks')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();

    if (fetchError) {
      console.error('Mevcut plan alınırken hata:', fetchError);
      return false;
    }

    // Görevi tamamla
    const updatedDailyGoals = { ...currentPlan.daily_goals };
    if (updatedDailyGoals[day] && updatedDailyGoals[day].tasks) {
      const task = updatedDailyGoals[day].tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = true;
      }
    }

    // Tamamlanan görevleri güncelle
    const updatedCompletedTasks = { ...currentPlan.completed_tasks };
    if (!updatedCompletedTasks[day]) {
      updatedCompletedTasks[day] = [];
    }
    updatedCompletedTasks[day].push(taskId);

    const { error: updateError } = await supabase
      .from('study_plans')
      .update({
        daily_goals: updatedDailyGoals,
        completed_tasks: updatedCompletedTasks,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('week_start', weekStart);

    if (updateError) {
      console.error('Görev tamamlama hatası:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Görev tamamlama hatası:', error);
    return false;
  }
}

// Çalışma oturumu başlat
export async function startStudySession(userId, subject, sessionType = 'pomodoro') {
  try {
    const sessionData = {
      user_id: userId,
      session_start: new Date().toISOString(),
      subject: subject,
      session_type: sessionType,
      notes: ''
    };

    const { data, error } = await supabase
      .from('study_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Çalışma oturumu başlatılırken hata:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Çalışma oturumu başlatma hatası:', error);
    return null;
  }
}

// Çalışma oturumu bitir
export async function endStudySession(sessionId, durationMinutes, questionsSolved, correctAnswers, notes = '') {
  try {
    const { error } = await supabase
      .from('study_sessions')
      .update({
        session_end: new Date().toISOString(),
        duration_minutes: durationMinutes,
        questions_solved: questionsSolved,
        correct_answers: correctAnswers,
        notes: notes
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Çalışma oturumu bitirilirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Çalışma oturumu bitirme hatası:', error);
    return false;
  }
}

// Çalışma istatistiklerini kaydet
export async function saveStudyStatistics(userId, studyDate, totalQuestions, correctAnswers, wrongAnswers, studyTimeMinutes, subjectsStudied) {
  try {
    const accuracyPercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const { error } = await supabase
      .from('study_statistics')
      .upsert({
        user_id: userId,
        study_date: studyDate,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers,
        study_time_minutes: studyTimeMinutes,
        subjects_studied: subjectsStudied,
        accuracy_percentage: accuracyPercentage
      }, { onConflict: ['user_id', 'study_date'] });

    if (error) {
      console.error('Çalışma istatistikleri kaydedilirken hata:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Çalışma istatistikleri kaydetme hatası:', error);
    return false;
  }
}

// Kullanıcı hedefi oluştur
export async function createUserGoal(userId, goalType, goalTitle, goalDescription, targetValue, goalSubject, deadline) {
  try {
    const goalData = {
      user_id: userId,
      goal_type: goalType,
      goal_title: goalTitle,
      goal_description: goalDescription,
      target_value: targetValue,
      current_value: 0,
      goal_subject: goalSubject,
      deadline: deadline,
      is_completed: false
    };

    const { data, error } = await supabase
      .from('user_goals')
      .insert(goalData)
      .select()
      .single();

    if (error) {
      console.error('Hedef oluşturulurken hata:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Hedef oluşturma hatası:', error);
    return null;
  }
}

// Hedef ilerlemesini güncelle
export async function updateGoalProgress(goalId, currentValue) {
  try {
    const { data: goal, error: fetchError } = await supabase
      .from('user_goals')
      .select('target_value')
      .eq('id', goalId)
      .single();

    if (fetchError) {
      console.error('Hedef alınırken hata:', fetchError);
      return false;
    }

    const isCompleted = currentValue >= goal.target_value;

    const { error: updateError } = await supabase
      .from('user_goals')
      .update({
        current_value: currentValue,
        is_completed: isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId);

    if (updateError) {
      console.error('Hedef güncellenirken hata:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Hedef güncelleme hatası:', error);
    return false;
  }
}

// Kullanıcının hedeflerini getir
export async function getUserGoals(userId) {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Hedefler alınırken hata:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Hedefler alma hatası:', error);
    return [];
  }
}

// Çalışma oturumlarını getir
export async function getStudySessions(userId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_start', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Çalışma oturumları alınırken hata:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Çalışma oturumları alma hatası:', error);
    return [];
  }
}

// Haftalık çalışma istatistiklerini getir
export async function getWeeklyStudyStats(userId, weekStart) {
  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const { data, error } = await supabase
      .from('study_statistics')
      .select('*')
      .eq('user_id', userId)
      .gte('study_date', weekStart)
      .lte('study_date', weekEnd.toISOString().split('T')[0])
      .order('study_date', { ascending: true });

    if (error) {
      console.error('Haftalık istatistikler alınırken hata:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Haftalık istatistikler alma hatası:', error);
    return [];
  }
}

// Yardımcı fonksiyonlar
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi başlangıç
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}s ${mins}dk`;
}

export function calculateProgress(completed, total) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
