const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();
const PORT = 9002;
const fs = require("fs");
const cors = require("cors");

const Imap = require("imap");
const { simpleParser } = require("mailparser");
const reportRouter = require("./src/routers/report.router");

// Body Parser Middleware
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://RiverLee:XCX9FtlsJaSkntGv@cluster0.pdpxvxa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

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
    enum: ["Not Sent", "Sent", "Failed", "Dead Mail"],
    default: "Not Sent",
  },
});

const CompanyEmail = mongoose.model("CompanyEmail", CompanyEmailSchema);

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "senvestgroup@senvest.org",
    pass: "0505@Senvest",
  },
  dkim: {
    domainName: "senvest.org",
    keySelector: "senvest",
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIBOgIBAAJBAL/aU5GdF2fEylBcJH2UEX/Fey8G4M8dyIkVvFqZPUtwc2gk7v9F
Fz2gPRKEUrPAdN8I1mRVGhGoUoikX0x8o28CAwEAAQJBALRf1wCqig6yDZ9K8+Uo
ibfYF3G7LPI8dmowf8bZzmtm18fgDpXY7qq9y0fQWVh7wTuMZ0SIR3M7Xp35BHHx
jNECIQDzRpv33yTq3cvDGWWkCFiPnxYaT5YmoI20OiyRnZGf7wIhAMZ9Y6U+mf6G
OUgQK3ZPP/+Rmh0cMIB9F7Rekkscd5vFAiAHazWzA9DD9sXkL3cR9HQL5RWWZkFy
5M4ShhvFoipPEwIhAOF9zkRj2ECr6oYmhLqOWT9J2bdwMnxlPnvMcech8JyzAiB3
zXcbMiApHRRSpfpvT5E8ktlsw9iSvNO1InXq56Ed0w==
-----END RSA PRIVATE KEY-----`,
  },
});

const stopServer = () => {
  server.close(() => {
    console.log("Server has been stopped");
  });
};

const mailList = [
  { mail: "hieu", name: "Hiếu" },
  { mail: "vu", name: "Vũ" },
  { mail: "giang", name: "Giang" },
  { mail: "dung", name: "Dũng" },
  { mail: "hoa", name: "Hoa" },
];

// title: [GNF-JAPAN] Sản xuất - Sản phẩm Cà phê đang được các khách hàng Nhật Bản của chúng tôi quan tâm và chú ý đến

// mailContent: Tôi đã xem thông tin sản phẩm của công ty bạn trên Trang Vàng Việt Nam và muốn liên hệ với bạn. Công ty chúng tôi là doanh nghiệp Nhật Bản hoạt động tại Việt Nam, chủ yếu kinh doanh với khách hàng đến từ Nhật Bản. Lý do tôi gửi câu hỏi này là vì một trong những công ty đối tác của chúng tôi có một số câu hỏi về sản phẩm của bạn (tiếng Nhật), vì vậy tôi thay mặt họ liên hệ với bạn. Nếu có thể, bạn có thể vui lòng gửi cho chúng tôi thêm thông tin chi tiết về sản phẩm của bạn cùng với bản introduction (giới thiệu) và gửi bảng giá (nếu có)

let pdfAttachment = fs.readFileSync("./Điều Lệ Quỹ Trái Tim Việt.pdf");

const sendEmails = async (req) => {
  try {
    const emails = await CompanyEmail.find({
      status: "Not Sent",
      email: { $regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ },
    }).limit(1);

    if (emails.length == 0) {
      return { success: false, message: "Done." };
    }

    for (let i = 0; i < emails.length; i++) {
      if (emails[i] && emails[i].email.includes("@")) {
        let template = fs.readFileSync("./mail-template.html", {
          encoding: "utf-8",
        });

        template = template.replaceAll(
          "{{COMPANY_NAME}}",
          emails[i].companyName
        );

        template = template.replaceAll(
          "{{GENDER}}",
          emails[i].gender === "M" ? "Ông" : "Bà"
        );

        const mailOptions = {
          from: '"Senvest Group" <senvestgroup@senvest.org>',
          to: emails[i].email,
          subject: "Thư Kêu Gọi Ủng Hộ Trẻ Em Vùng Sâu Vùng Xa Việt Nam",
          html: template,
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
            console.log("error", emails[i].email);
            await CompanyEmail.findByIdAndUpdate(emails[i]._id, {
              status: "Failed",
            });
            process.on("SIGTERM", stopServer);
            return {
              success: false,
              message: "Failed to send email.",
              failedEmail: emails[i].email,
            };
          } else {
            console.log("Email sent: " + emails[i].email);
            await CompanyEmail.findByIdAndUpdate(emails[i]._id, {
              status: "Sent",
            });
            return {
              success: true,
              message: "Email sent: " + info.response,
              failedEmail: "",
            };
          }
        });
      } else {
        console.log("Done");
        process.on("SIGTERM", stopServer);
        return { success: false, message: "Done." };
      }
    }
  } catch (err) {
    console.log("err", err);
    process.on("SIGTERM", stopServer);
    return { success: false, message: "Failed to send email." };
  }
};

app.post("/send-emails", async (req, res) => {
  // Cài đặt Interval để gửi email mỗi 5 phút
  const intervalId = setInterval(async () => {
    const result = await sendEmails(req);
    if (result && !result.success) {
      clearInterval(intervalId); // Stop the interval if a send attempt fails
      return res.status(500).json(result);
    }
  }, 10000);
});

app.get("/emails", async (req, res) => {
  const {
    page = 1,
    limit = 50,
    companyName,
    email,
    industry,
    status,
  } = req.query;
  let searchQuery = {};

  // Thêm điều kiện tìm kiếm nếu có
  if (companyName) {
    searchQuery.companyName = { $regex: companyName, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
  }
  if (email) {
    searchQuery.email = { $regex: email, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
  }
  if (status) {
    searchQuery.status = { $regex: status, $options: "i" };
  }

  if (industry) {
    searchQuery.industry = { $regex: industry, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
  }

  try {
    const emails = await CompanyEmail.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const deadMailCount = await CompanyEmail.countDocuments({
      status: "Dead Mail",
    });
    const SendMailCount = await CompanyEmail.countDocuments({ status: "Sent" });
    const NotSendMailCount = await CompanyEmail.countDocuments({
      status: "Not Sent",
    });
    const mailCount = await CompanyEmail.countDocuments();

    const count = await CompanyEmail.countDocuments(searchQuery);

    res.json({
      total: count,
      page,
      limit,
      data: emails,
      deadMailCount,
      SendMailCount,
      NotSendMailCount,
      mailCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo document
const list = [
  {
    email: "huynhhlinh99@gmail.com",
    companyName: "Huynh Linh 1",
    gender: "Bà",
  },
  {
    email: "leopham2008@gmail.com",
    companyName: "Huynh Linh 2",
    gender: "Ông",
  },
  {
    email: "legiangbmt010@gmail.com",
    companyName: "Giang Le Thanh 2",
    gender: "Bà",
  },
];

app.post("/create-emails", async (req, res) => {
  try {
    const createdEmails = await CompanyEmail.insertMany(list);
    res.send(createdEmails);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint để cập nhật trạng thái của một email
app.patch("/emails/:id/dead", async (req, res) => {
  try {
    const updatedEmail = await CompanyEmail.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "Dead Mail" } },
      { new: true } // Trả về document sau khi cập nhật
    );

    if (!updatedEmail) {
      return res.status(404).send("Email not found");
    }

    res.send(updatedEmail);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint để cập nhật trạng thái của một email
app.patch("/emails/:id/notsent", async (req, res) => {
  try {
    const updatedEmail = await CompanyEmail.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "Not Sent" } },
      { new: true } // Trả về document sau khi cập nhật
    );

    if (!updatedEmail) {
      return res.status(404).send("Email not found");
    }

    res.send(updatedEmail);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API để nhận và insert dữ liệu
app.post("/upload-json", async (req, res) => {
  const companies = req.body;
  const operations = companies.map((company) =>
    CompanyEmail.updateOne(
      { email: company.email }, // Tìm kiếm dựa trên email
      { $set: company }, // Cập nhật các trường dữ liệu hoặc thêm mới
      { upsert: true } // Nếu không tìm thấy, tạo mới
    )
  );

  Promise.all(operations)
    .then((results) => {
      const updatedCount = results.filter(
        (res) => res.modifiedCount > 0
      ).length;
      const insertedCount = results.filter(
        (res) => res.upsertedCount > 0
      ).length;
      res
        .status(201)
        .send(
          `Updated ${updatedCount} companies, Inserted ${insertedCount} new companies`
        );
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error processing companies");
    });
});

app.get("/check-mails-duplicate", async (req, res) => {
  try {
    const mailList = [
      "saythanghoaso1@gmail.com",
      "htxthangtien@gmail.com",
      "congtycophannongsannh@gmail.com",
      "trade@simexcodl.com.vn",
      "mkt.retail@simexcodl.com.vn",
      "anthai01@hiup.vn",
      "locnph@trungnguyenlegend.com",
      "damaca2019@gmail.com",
      "hiepdv@kamina.vn",
      "nutrisoiljsc@gmail.com",
      "caosu@dakruco.com",
      "dinhduongcaonguyen@gmail.com",
      "kimdungdnutri@gmail.com",
      "info@cacaonamtruongson.com.vn",
      "huu_hoangdanh@missede.com",
      "trinhmuoiqlt@gmail.com",
      "htxbodaihungdaklak@gmail.com",
      "bananabrothersfarm@gmail.com",
      "nguyentuankhoi3@gmail.com",
      "mithuynguyen99@gmail.com",
      "thanhdung@gmail.com ",
      "thucphamxanhthanhdong@gmail.com",
      "caphetrunghoa1@gmail.com",
      "Lethioanh1910@gmail.com",
      "kien0705@hps.edu.vn",
      "vuongthanhcong84@gmail.com",
      "htxgnes@gmail.com",
      "havantuyen201068@gmail.com",
      "hoangngat2012 @gmail.com",
      "thuthumdrak@gmail.com",
      "ocnhoidaica@gmail.com",
      "nguyentuanh.aeroco@gmail.com",
      "muhaktrading@gmail.com",
      "trantuanh125@gmail.com",
      "dienvt@biasaigonmt.com",
      "nhihq@biasaigonmt.com",
      "trade@simexcodl.com.vn",
      "mkt.retail@simexcodl.com.vn",
      "anthai01@hiup.vn",
      "locnph@trungnguyenlegend.com",
      "Thuy.nuixanhvff@gmail.com",
      "vuongthanhcong84@gmail.com",
      "nguyentuankhoi3@gmail.com",
      "mithuynguyen99@gmail.com",
      "Hueban2020@gmail.com",
      "Thuydungfurniture.export@gmail.com",
      "caosu@dakruco.com",
      "linhpx@donga.edu.vn",
      "hanghtn@donga.edu.vn",
      "dttthuy86@bmtuvietnam.com",
      "maingoc5994@gmai.com",
      "than.dlc@vnpt.vn",
      "hai@eagodi.com",
      "Xuanchinh3333@gmail.com",
      "phangiaphatxd@gmail.com",
      "anhthuaneakar@gmail.com",
      "info@cacaonamtruongson.com.vn",
      "info@minudo.vn",
      "thucphamxanhthanhdong@gmail.com",
      "nutrisoiljsc@gmail.com",
      "saythanghoaso1@gmail.com",
      "hoangngat2012 @gmail.com",
      "bananabrothersfarm@gmail.com",
      "damaca2019@gmail.com",
      "huu_hoangdanh@missede.com",
      "congtycophannongsannh@gmail.com",
      "thanhdung@gmail.com ",
      "hiepdv@kamina.vn",
      "caphetrunghoa1@gmail.com",
      "thuthumdrak@gmail.com",
      "htxthangtien@gmail.com",
      "havantuyen201068@gmail.com",
      "htxgnes@gmail.com",
    ];

    const mailExList = [];

    for (let i = 0; i < mailList.length; i++) {
      const item = mailList[i];

      const emails = await CompanyEmail.find({ email: item }).exec();

      if (emails && emails.length > 0) {
        mailExList.push(item);
      }
    }

    res.json({
      mailExList,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/remove-duplicates", async (req, res) => {
  try {
    // Tìm tất cả công ty, sắp xếp theo email và ngày tạo (nếu có)
    let companies = await CompanyEmail.find({ status: "Not Sent" }).sort({
      email: 1,
    });

    let previousEmail = "";
    let duplicates = [];

    companies.forEach((company) => {
      if (company.email === previousEmail) {
        // Lưu trữ các ID của công ty trùng để xoá sau
        duplicates.push(company._id);
      } else {
        previousEmail = company.email;
      }
    });

    // Xoá các bản ghi trùng lặp, giữ lại bản ghi đầu tiên trong mỗi nhóm trùng email
    if (duplicates.length > 0) {
      await CompanyEmail.deleteMany({ _id: { $in: duplicates } });
    }

    res.send({
      removed: duplicates.length,
      message: "Duplicate companies removed.",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get("/check-dead-mail", async (req, res) => {
  try {
    const imapConfig = {
      user: "no-reply@gmajor.biz",
      password: "Fkgkhiyou-66-hjhghj",
      host: "imap4.muumuu-mail.com",
    };

    const imap = new Imap(imapConfig);

    function openInbox(cb) {
      imap.openBox("INBOX", true, cb);
    }

    imap.once("ready", function () {
      openInbox(function (err, box) {
        if (err) throw err;
        const today = new Date();
        imap.search(["SEEN"], function (err, results) {
          if (err) throw err;
          const f = imap.fetch(results, {
            bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
          });
          f.on("message", function (msg, seqno) {
            console.log("Message #%d", seqno);
            msg.on("body", function (stream, info) {
              simpleParser(stream, (err, mail) => {
                if (err) throw err;
                const textMail = mail.text;

                if (textMail) {
                  const emailRegex =
                    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
                  const emails = textMail.match(emailRegex);

                  if (emails && emails.length > 0) {
                    console.log(emails);
                  } else {
                    console.log("Not get");
                  }
                } else {
                  console.log("Can not");
                }
              });
            });
          });
          f.once("error", function (err) {
            console.log("Fetch error: " + err);
          });
          f.once("end", function () {
            console.log("Done fetching all messages!");
            imap.end();
          });
        });
      });
    });

    imap.once("error", function (err) {
      console.log(err);
    });

    imap.once("end", function () {
      console.log("Connection ended");
    });

    imap.connect();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get("/sumary-industry", async (req, res) => {
  CompanyEmail.aggregate([
    {
      $group: {
        _id: "$industry",
        totalCompanies: { $sum: 1 },
        notSentCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "Not Sent"] }, 1, 0],
          },
        },
        otherStatusCount: {
          $sum: {
            $cond: [{ $ne: ["$status", "Not Sent"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        industry: "$_id",
        totalCompanies: 1,
        notSentCount: 1,
        otherStatusCount: 1,
      },
    },
    {
      $match: {
        $expr: { $eq: ["$notSentCount", "$totalCompanies"] },
      },
    },
    {
      $sort: { totalCompanies: -1 },
    },
  ])
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

// API trả về report
app.use(reportRouter);

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);
