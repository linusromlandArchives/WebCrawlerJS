const mongoose = require("mongoose");

//Creates the LinkSchema and exports it
const LinkSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true,
  },
  visited: {
    type: Boolean,
    default: false,
  },
  hits: {
      type: Number,
      default: 1
  }
});

const Link = mongoose.model("link", LinkSchema);

module.exports = Link;