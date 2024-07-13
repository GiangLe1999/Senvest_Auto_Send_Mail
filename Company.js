const CompanyEmailSchema = new mongoose.Schema({
    companyName: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    industry: String,
    status: {
      type: String,
      enum: ['Not Sent', 'Sent', 'Failed', 'Dead Mail'],
      default: 'Not Sent',
    },
  });
  
  const CompanyEmail = mongoose.model('CompanyEmail', CompanyEmailSchema);