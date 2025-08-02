import { supabase } from './supabase.js';

const aliciSelect = document.getElementById('alici-select');
const mesajListesi = document.getElementById('mesaj-listesi');
const mesajForm = document.getElementById('mesaj-form');
const mesajInput = document.getElementById('mesaj-input');

let currentUser = null;
let selectedRecipientId = null;

async function init() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    alert('Lütfen giriş yapınız.');
    window.location.href = './login.html';
    return;
  }
  currentUser = session.user;

  if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = currentUser.email || currentUser.id;
  }

  await loadUsers();

  aliciSelect.addEventListener('change', async (e) => {
    selectedRecipientId = e.target.value || null;
    mesajListesi.innerHTML = '';
    if (selectedRecipientId) {
      await loadMessages();
      listenNewMessages();
    }
  });

  mesajForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = mesajInput.value.trim();
    if (!text || !selectedRecipientId) return;
    await sendMessage(text);
    mesajInput.value = '';
  });
}

async function loadUsers() {
  const { data, error } = await supabase
    .from('ogrenciler')
    .select('user_id as id, ad, soyad, rol')
    .neq('user_id', currentUser.id);

  if (error) {
    console.error('Kullanıcılar alınamadı:', error);
    return;
  }

  aliciSelect.innerHTML = '<option value="">Mesaj göndermek için öğrenci veya koç seçiniz</option>';
  data.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = `${user.ad || ''} ${user.soyad || ''} (${user.rol || 'bilinmiyor'})`.trim();
    aliciSelect.appendChild(option);
  });
}

async function loadMessages() {
  if (!selectedRecipientId) return;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${currentUser.id},recipient_id.eq.${selectedRecipientId}),and(sender_id.eq.${selectedRecipientId},recipient_id.eq.${currentUser.id})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Mesajlar alınamadı:', error);
    return;
  }

  mesajListesi.innerHTML = '';
  data.forEach(mesaj => {
    addMessageToList(mesaj);
  });

  mesajListesi.scrollTop = mesajListesi.scrollHeight;
}

let subscription = null;
function listenNewMessages() {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
  subscription = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      const mesaj = payload.new;
      if (
        (mesaj.sender_id === currentUser.id && mesaj.recipient_id === selectedRecipientId) ||
        (mesaj.sender_id === selectedRecipientId && mesaj.recipient_id === currentUser.id)
      ) {
        addMessageToList(mesaj);
        mesajListesi.scrollTop = mesajListesi.scrollHeight;
      }
    })
    .subscribe();
}

async function sendMessage(text) {
  const { error } = await supabase
    .from('messages')
    .insert([
      {
        sender_id: currentUser.id,
        recipient_id: selectedRecipientId,
        message: text,
        created_at: new Date().toISOString()
      }
    ]);
  if (error) {
    console.error('Mesaj gönderilemedi:', error);
    alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
  }
}

function addMessageToList(mesaj) {
  const div = document.createElement('div');
  div.style.marginBottom = '8px';
  const isCurrentUserSender = mesaj.sender_id === currentUser.id;
  div.style.textAlign = isCurrentUserSender ? 'right' : 'left';
  div.innerHTML = `
    <span style="display:inline-block; padding:6px 12px; border-radius:12px; background-color:${isCurrentUserSender ? '#2980b9' : '#bdc3c7'}; color:#fff; max-width: 70%; word-wrap: break-word;">
      ${mesaj.message}
    </span>
    <br/>
    <small style="color:#999; font-size:0.75rem;">
      ${new Date(mesaj.created_at).toLocaleString()}
    </small>
  `;
  mesajListesi.appendChild(div);
}

init();
