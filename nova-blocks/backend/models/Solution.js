const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  solution: { type: String, required: true },
}, { timestamps: true });

const Solution = mongoose.model('Solution', solutionSchema);

module.exports = Solution;
