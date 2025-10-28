// --- Screen Navigation Logic ---
function showScreen(id) {
  document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

document.getElementById('start-button').addEventListener('click', () => {
  showScreen('main-menu');
});

document.getElementById('voice-s2s-button').addEventListener('click', () => {
  showScreen('s2s-screen');
  // Cek ketersediaan API dan microphone saat masuk ke S2S screen
  if (!('webkitSpeechRecognition' in window)) {
      document.getElementById('mic-status').textContent = 'Web Speech Recognition tidak didukung di browser ini. Mohon gunakan Chrome atau Edge.';
      document.getElementById('record-button').disabled = true;
  } else {
      document.getElementById('record-button').disabled = false;
  }
});

// --- Speech-to-Speech (S2S) Core Logic ---

// Variabel Global
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
const micButton = document.getElementById('record-button');
const micStatus = document.getElementById('mic-status');
const userTranscript = document.getElementById('user-transcript');
const aiResponseText = document.getElementById('ai-response-text');
const loadingSpinner = document.getElementById('loading-spinner');
const playTTSButton = document.getElementById('play-tts-button');

let isRecording = false;
let audioResponse = null; // Untuk menyimpan objek audio TTS

// Konfigurasi Speech Recognition
recognition.lang = 'id-ID'; // Mengatur bahasa ke Bahasa Indonesia
recognition.interimResults = false; // Hanya memberikan hasil final

// --- Event Listeners untuk STT ---

recognition.onstart = () => {
  isRecording = true;
  micStatus.textContent = 'Mendengarkan... Bicara sekarang!';
  micButton.classList.add('recording');
  userTranscript.value = ''; // Hapus transkripsi lama
};

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  userTranscript.value = transcript;
  micStatus.textContent = 'Transkripsi selesai. Menganalisa jawaban...';
  
  // Panggil Gemini API setelah transkripsi selesai
  callGeminiAPI(transcript);
};

recognition.onerror = (event) => {
  console.error('Speech Recognition Error:', event.error);
  if (isRecording) {
      micStatus.textContent = 'Terjadi kesalahan atau waktu bicara habis. Coba lagi.';
  }
  stopRecordingUI();
};

recognition.onend = () => {
  // Jika tidak ada error, onend dipanggil setelah onresult,
  // jadi kita hanya perlu memastikan UI berhenti jika belum.
  stopRecordingUI();
};

function stopRecordingUI() {
  isRecording = false;
  micButton.classList.remove('recording');
  // Jika onresult belum dipanggil (misalnya user tidak bicara)
  if (userTranscript.value === '') {
      micStatus.textContent = 'Tekan dan tahan tombol di bawah untuk berbicara...';
  }
}


// --- Handling Tombol Tekan-Tahan untuk Bicara ---
// Menggunakan mousedown dan mouseup/mouseleave untuk meniru "press and hold"

micButton.addEventListener('mousedown', () => {
  if (!isRecording) {
      recognition.start();
  }
});

// Untuk mobile/touchscreen, ganti mousedown/mouseup dengan touchstart/touchend
micButton.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Mencegah scrolling
  if (!isRecording) {
      recognition.start();
  }
});

// Hentikan perekaman saat tombol dilepas
micButton.addEventListener('mouseup', () => {
  if (isRecording) {
      recognition.stop();
  }
});

micButton.addEventListener('touchend', (e) => {
  e.preventDefault();
  if (isRecording) {
      recognition.stop();
  }
});

// --- Gemini & TTS (Backend API Simulation) ---

/**
* Fungsi untuk memanggil backend (Vercel Serverless Function) 
* yang akan menjalankan Gemini dan TTS.
* @param {string} text The user's transcribed question.
*/
async function callGeminiAPI(text) {
  if (!text) {
      aiResponseText.textContent = "Mohon maaf, suara Anda tidak terdeteksi. Coba ulangi.";
      micStatus.textContent = "Tekan dan tahan tombol di bawah untuk berbicara...";
      return;
  }

  loadingSpinner.style.display = 'block';
  aiResponseText.textContent = "Gemini sedang berpikir... 🧠";
  playTTSButton.disabled = true;

  try {
      // ⚠️ PENTING: Ganti URL ini dengan endpoint Vercel Serverless Function Anda
      const response = await fetch('/api/chat', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, lang: 'id-ID' })
      });

      if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Asumsi data berisi { text: "Jawaban Gemini", audioUrl: "url_ke_file_mp3_tts" }
      const geminiText = data.text || "Terjadi kesalahan saat mendapatkan jawaban.";
      const audioUrl = data.audioUrl; 

      aiResponseText.textContent = geminiText;
      micStatus.textContent = "Jawaban siap. Tekan 'Bacakan' untuk mendengar.";

      if (audioUrl) {
          setupTTSAudio(audioUrl);
          playTTSButton.disabled = false;
      } else {
           micStatus.textContent = "Jawaban teks tersedia, namun audio gagal dimuat.";
      }
      
  } catch (error) {
      console.error("Error calling Gemini/TTS Backend:", error);
      aiResponseText.textContent = "Terjadi masalah koneksi atau server saat mencari jawaban.";
      micStatus.textContent = "Error, coba lagi.";
  } finally {
      loadingSpinner.style.display = 'none';
      micButton.disabled = false;
  }
}

// --- TTS Audio Playback Logic ---

function setupTTSAudio(url) {
  if (audioResponse) {
      audioResponse.pause();
      audioResponse.src = '';
  }
  audioResponse = new Audio(url);
  
  // Aktifkan tombol Hentikan dan matikan Bacakan saat play
  audioResponse.onplay = () => {
      playTTSButton.disabled = true;
      stopTTSButton.disabled = false;
  };
  
  // Matikan tombol Hentikan dan aktifkan Bacakan saat selesai
  audioResponse.onended = () => {
      playTTSButton.disabled = false;
      stopTTSButton.disabled = true;
  };
  
  // Coba putar audio secara otomatis setelah dimuat (opsional)
  // audioResponse.play().catch(e => console.log("Autoplay diblokir:", e));
}

playTTSButton.addEventListener('click', () => {
  if (audioResponse) {
      audioResponse.play().catch(e => {
          alert("Gagal memutar audio. Pastikan perangkat Anda tidak dalam mode senyap atau browser mengizinkan autoplay.");
      });
  }
});

stopTTSButton.addEventListener('click', () => {
  if (audioResponse) {
      audioResponse.pause();
      audioResponse.currentTime = 0; // Kembalikan ke awal
      playTTSButton.disabled = false;
      stopTTSButton.disabled = true;
  }
});

// --- Reset S2S ---

function resetS2S() {
  userTranscript.value = '';
  aiResponseText.textContent = 'Jawaban dari Gemini akan muncul di sini.';
  micStatus.textContent = 'Tekan dan tahan tombol di bawah untuk berbicara...';
  if (audioResponse) {
      audioResponse.pause();
      audioResponse = null;
  }
  playTTSButton.disabled = true;
  stopTTSButton.disabled = true;
  micButton.disabled = false;
  loadingSpinner.style.display = 'none';
}

// Inisialisasi: tampilkan layar sambutan saat pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
  showScreen('welcome-screen');
  resetS2S(); // Memastikan semua elemen dalam keadaan reset
});