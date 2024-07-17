const mongoose = require("mongoose");

const CompanyEmailSchema = new mongoose.Schema({
  companyName: String,
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Ông", "Bà"],
    default: "Ông",
  },
  status: {
    type: String,
    enum: ["Not Sent", "Sent", "Failed", "Not Exists", "Out of Storage Space"],
    default: "Not Sent",
  },
});

const CompanyEmail = mongoose.model("CompanyEmail", CompanyEmailSchema);

module.exports = CompanyEmail;
