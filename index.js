const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");
const cors = require("cors");
const { emailListForCreating } = require("./src/data");
const CompanyEmail = require("./src/models/Company");
const { isValidEmailSyntax, checkDomain, checkSMTP } = require("./src/utils");
require("dotenv").config();

const PORT = 9002;

// Initialize app
const app = express();
// Middlewares
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);
// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Attachment
let pdfAttachment = fs.readFileSync("./files/Điều Lệ Quỹ Trái Tim Việt.pdf");
// HTML template
let template = fs.readFileSync("./files/mail-template.html", {
  encoding: "utf-8",
});

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.STMP_PASSWORD,
  },
});

// Send mail function
const sendEmails = async (req) => {
  try {
    const emails = await CompanyEmail.find({
      status: "Not Sent",
      email: { $regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ },
    }).limit(1);

    if (emails.length === 0) {
      return { success: false, message: "Done." };
    }

    for (let i = 0; i < emails.length; i++) {
      const emailDoc = emails[i];
      const email = emailDoc.email;

      if (!isValidEmailSyntax(email)) {
        console.log(`${email} has invalid syntax.`);
        await CompanyEmail.findByIdAndUpdate(emailDoc._id, {
          status: "Invalid Syntax",
        });
        continue;
      }

      const domain = email.split("@")[1];
      const domainIsValid = await checkDomain(domain);

      if (!domainIsValid) {
        console.log(`${email} has an invalid domain.`);
        await CompanyEmail.findByIdAndUpdate(emailDoc._id, {
          status: "Invalid Domain",
        });
        continue;
      }

      const smtpIsValid = await checkSMTP(email);
      if (!smtpIsValid) {
        console.log(`${email} has an invalid mailbox.`);
        await CompanyEmail.findByIdAndUpdate(emailDoc._id, {
          status: "Invalid Mailbox",
        });
        continue;
      }

      template = template.replaceAll("{{COMPANY_NAME}}", emailDoc.companyName);
      template = template.replaceAll(
        "{{GENDER}}",
        emailDoc.gender === "M" ? "Ông" : "Bà"
      );

      const mailOptions = {
        from: '"Senvest Group" <senvestgroup@senvest.org>',
        to: email,
        subject: "Thư Kêu Gọi Ủng Hộ Trẻ Em Vùng Sâu Vùng Xa Việt Nam",
        html: template,
        // Bao gồm cả text và html version
        text: "",
        attachments: [
          {
            filename: "Điều Lệ Quỹ Trái Tim Việt.pdf",
            content: pdfAttachment,
            encoding: "base64",
          },
        ],
        headers: {
          "X-Priority": "3",
          "X-Mailer": "Nodemailer",
          "List-Unsubscribe": "<mailto:unsubscribe@senvest.org>",
        },
      };

      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log(error);
          console.log("error", email);
          await CompanyEmail.findByIdAndUpdate(emailDoc._id, {
            status: "Failed",
          });
        } else {
          console.log("Email sent: " + email);
          await CompanyEmail.findByIdAndUpdate(emailDoc._id, {
            status: "Sent",
          });
        }
      });
    }
    return { success: true, message: "Processing emails." };
  } catch (err) {
    console.log("err", err);
    return { success: false, message: "Failed to send email." };
  }
};

// Endpoint for start sending emails
app.post("/send-emails", async (req, res) => {
  let isSending = false;
  let attempts = 0;
  const maxAttempts = 10; // Maximum attempts to avoid infinite loops

  const processEmails = async () => {
    if (isSending) return; // Prevent overlapping intervals
    isSending = true;
    attempts++;

    try {
      const result = await sendEmails(req);

      if (result && !result.success) {
        clearInterval(intervalId);
        isSending = false;
        return res.status(500).json(result);
      }

      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        return res
          .status(200)
          .json({ success: true, message: "Emails processed." });
      }
    } catch (err) {
      clearInterval(intervalId);
      isSending = false;
      return res.status(500).json({
        success: false,
        message: "An error occurred while sending emails.",
      });
    } finally {
      isSending = false;
    }
  };

  // Set interval to process emails every 5 minutes
  const intervalId = setInterval(processEmails, 5 * 60 * 1000);

  // Process emails immediately for the first time
  await processEmails();
});

// Create data for testing
app.post("/create-emails", async (req, res) => {
  try {
    const createdEmails = await CompanyEmail.insertMany(emailListForCreating);
    res.send(createdEmails);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
