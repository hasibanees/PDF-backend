// models/ConversionJob.js
const mongoose = require('mongoose');

const ConversionJobSchema = new mongoose.Schema({
  fileName: String,
  jobId: String,
  status: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConversionJob', ConversionJobSchema);
