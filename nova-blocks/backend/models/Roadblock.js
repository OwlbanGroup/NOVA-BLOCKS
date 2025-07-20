const mongoose = require('mongoose');

const roadblockSchema = new mongoose.Schema({
  description: { type: String, required: true },
  status: { type: String, default: 'Reported' },
}, { timestamps: true });

const Roadblock = mongoose.model('Roadblock', roadblockSchema);

module.exports = Roadblock;
