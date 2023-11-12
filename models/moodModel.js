const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mood: {
    type: String,
    enum: ["happy", "sad", "angry", "neutral"],
    required: true,
  },
  note: {
    type: String,
    maxlength: 255,
  },
  date: {
    type: Date,
  },
});

const Mood = mongoose.model("Mood", moodSchema);

module.exports = Mood;
