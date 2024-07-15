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
    enum: [
      "Not Sent",
      "Sent",
      "Failed",
      "Dead Mail",
      "Invalid Syntax",
      "Invalid Domain",
      "Invalid Mailbox",
    ],
    default: "Not Sent",
  },
});

const CompanyEmail = mongoose.model("CompanyEmail", CompanyEmailSchema);

module.exports = CompanyEmail;
