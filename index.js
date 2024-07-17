const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");
const cors = require("cors");
const { emailListForCreating, textVersionForEmail } = require("./src/data");
const CompanyEmail = require("./src/models/Company");
const { resolveMX, sendMailForTest } = require("./src/utils");
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
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Attachment
let pdfAttachment;
try {
  pdfAttachment = fs.readFileSync("./files/Điều Lệ Quỹ Trái Tim Việt.pdf");
} catch (err) {
  console.error("Error reading PDF file:", err);
}

// HTML template
let template;
try {
  template = fs.readFileSync("./files/mail-template.html", {
    encoding: "utf-8",
  });
} catch (err) {
  console.error("Error reading HTML template file:", err);
}

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Test SMTP connection
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP connection successful.");
  }
});

// Send mail function
const sendEmails = async (req) => {
  try {
    // Step 1: Get not sent email
    const emails = await CompanyEmail.find({
      status: "Not Sent",
      email: { $regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ },
    }).limit(1);

    if (emails.length === 0) {
      return { success: false, message: "Out of Not Sent emails" };
    }

    const emailDoc = emails[0];
    const email = emailDoc.email;
    const domain = email.split("@")[1];

    // Step 2: Resolve MX and check email validity
    let smtpServer;
    try {
      smtpServer = await new Promise((resolve, reject) => {
        resolveMX(domain, (err, smtpServer) => {
          if (err) {
            console.error("Error resolving MX:", err);
            CompanyEmail.findByIdAndUpdate(emailDoc._id, {
              status: "MX Error",
            }).exec();
            reject(err);
          } else {
            resolve(smtpServer);
          }
        });
      });
    } catch (err) {
      console.error("Error resolving MX:", err);
      return; // Exit function if there's an error resolving MX
    }

    // Step 3: Test email existence or handle other errors using sendMailForTest
    try {
      const { err, exists } = await sendMailForTest(
        smtpServer,
        "legiangbmt09@gmail.com",
        email
      );

      if (err && !exists) {
        throw err(err);
      } else {
        // Step 4: Prepare email template and options
        template = template.replaceAll(
          "{{COMPANY_NAME}}",
          emailDoc.companyName
        );
        template = template.replaceAll(
          "{{GENDER}}",
          emailDoc.gender === "M" ? "Ông" : "Bà"
        );

        const mailOptions = {
          from: '"Senvest Group" <senvestgroup@senvest.org>',
          to: email,
          subject: "Thư Kêu Gọi Ủng Hộ Trẻ Em Vùng Sâu Vùng Xa Việt Nam",
          html: template,
          text: textVersionForEmail,
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

        // Step 5: Send email and update status based on response
        transporter.sendMail(mailOptions, async (err, info) => {
          if (err) {
            console.error(err, email);
            console.log("Failed to send email to", email);
            await CompanyEmail.findByIdAndUpdate(emailDoc._id, {
              status: "Failed",
            }).exec();
          } else {
            console.log("Email sent successfully to", email);
            await CompanyEmail.findByIdAndUpdate(emailDoc._id, {
              status: "Sent",
            }).exec();
          }
        });
      }
    } catch (err) {
      console.log(err.err, email);
      await CompanyEmail.findByIdAndUpdate(emailDoc._id, {
        status: err.err,
      }).exec();
    }
  } catch (err) {
    console.error("Error fetching emails:", err);
  }
};

// Endpoint for start sending emails
app.post("/send-emails", async (req, res) => {
  let isSending = false;

  const processEmails = async () => {
    if (isSending) return; // Prevent overlapping intervals
    isSending = true;

    try {
      await sendEmails(req);
    } catch (err) {
      clearInterval(intervalId);
      isSending = false;
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "An error occurred while sending emails",
      });
    } finally {
      isSending = false;
    }
  };

  // Set interval to process emails every 2 minutes
  const intervalId = setInterval(processEmails, 0.2 * 60 * 1000);

  // Process emails immediately for the first time without waiting for the first interval
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
