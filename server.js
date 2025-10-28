const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Import chat API
const chatHandler = require('./api/chat');

// API endpoint
app.post('/api/chat', chatHandler);

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📱 Buka browser dan akses http://localhost:${PORT}`);
    console.log(`🔑 API Key Gemini: ${process.env.GEMINI_API_KEY ? '✅ Terdeteksi' : '❌ Tidak ditemukan'}`);
});
