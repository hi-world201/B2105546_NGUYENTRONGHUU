const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
});

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;

