const express = require('express');
const cors = require('cors');
const authRoutes = require('./authRoutes');
const storeRoutes = require('./storeRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 System server core layer operational on port ${PORT}`));