// models/bmiModel.js
const mongoose = require("mongoose");

const bmiSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
  },
  height: Number,
  weight: Number,
  // Add other necessary fields related to BMI
});

const BMI = mongoose.model("BMI", bmiSchema);

module.exports = BMI;
