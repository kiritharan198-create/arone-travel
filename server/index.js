const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic Route to check if server works
app.get('/', (req, res) => {
  res.send('ARONE Server is Running!');
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB (We will add the link in Step 4)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Database'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});