const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => res.json({ message: 'Hello from backend' }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/orders', require('./routes/myOrders.routes'));
app.use('/api/courier', require('./routes/courier.routes'));

module.exports = app;
