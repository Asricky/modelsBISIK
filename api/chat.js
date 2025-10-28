// api/chat.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

// Baca API key dari environment variable
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDKNEGMRMAULf8JV9ga5jb4IUBt2E7g-TE';

// Inisialisasi Gemini dengan API key
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Endpoint utama untuk memproses Speech-to-Text (STT) ke Speech-to-Speech (S2S).
 */
module.exports = async (req, res) => {

    try {
        const { prompt } = req.body; // Ambil prompt dari frontend

        if (!prompt) {
            return res.status(400).json({ error: "Missing 'prompt' in request body." });
        }

        // --- 1. PROMPTING GEMINI ---
        const systemInstruction = `Anda adalah asisten edukatif yang cerdas, empati, dan ramah. Tugas Anda adalah memberikan jawaban yang SANGAT SEDERHANA, SINGKAT, dan JELAS untuk anak berkebutuhan khusus (ABK) di SLB. Selalu jawab dalam Bahasa Indonesia yang mudah dipahami. Contoh: Jika ditanya 'apa itu gajah', jawablah 'Gajah adalah hewan besar yang punya belalai panjang. Belalai gunanya untuk mengambil makanan dan air.'`;

        // Dapatkan model Gemini
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponseText = response.text().trim();

        // --- 2. SIMULASI TEXT-TO-SPEECH (TTS) ---
        // PENTING: Gemini API TIDAK menyediakan TTS. Anda harus menggunakan API lain.
        // Di sini, kita akan SIMULASIKAN dengan URL dummy.
        // Anda harus MENGGANTI INI dengan integrasi API TTS nyata (misalnya, Google Cloud Text-to-Speech atau ElevenLabs) 
        // yang mengembalikan URL publik ke file audio yang telah dibuat.

        // Contoh integrasi TTS nyata:
        // const ttsResponse = await callExternalTTS(aiResponseText, 'id-ID');
        // const audioUrl = ttsResponse.public_url;

        // URL SIMULASI MP3 (Ganti dengan URL TTS ASLI Anda)
        const dummyAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; 

        // --- 3. KIRIM RESPON FINAL ---
        res.status(200).json({
            text: aiResponseText, // Jawaban Gemini
            audioUrl: dummyAudioUrl, // URL Audio TTS
            // Anda dapat menambahkan metadata ikon di sini
            // iconKey: "nasi_simbol" 
        });

    } catch (error) {
        console.error('GEMINI/TTS PROCESSING ERROR:', error);
        // Mengirimkan error 500 ke frontend
        res.status(500).json({ 
            error: "Internal server error during Gemini/TTS processing.",
            detail: error.message 
        });
    }
};

// --- Fungsi Dummy TTS (Anda harus mengimplementasikannya secara nyata) ---
/*
async function callExternalTTS(text, lang) {
    // Panggil API TTS nyata di sini
    // Misalnya, menggunakan Google Cloud TTS:
    // 1. Kirim teks ke Google TTS.
    // 2. Terima audio data (base64).
    // 3. Simpan audio ke Google Cloud Storage/AWS S3/atau layanan Vercel Blob.
    // 4. Dapatkan URL publik dari file tersebut.
    // 5. Kembalikan { public_url: "..." }
    
    return { public_url: 'URL_TTS_ASLI' };
}
*/