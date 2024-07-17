const dns = require("dns");
const net = require("net");

// Hàm để phân giải DNS và tìm SMTP server của domain
function resolveMX(domain, callback) {
  dns.resolveMx(domain, (err, addresses) => {
    if (err) {
      callback(err, null);
      return;
    }
    // Lấy MX record đầu tiên (thường là có priority thấp nhất)
    const mxRecord = addresses[0];
    // mxRecord echange là stmp server của domain
    callback(null, mxRecord.exchange);
  });
}

// Hàm gửi email thông qua SMTP server
async function sendMailForTest(smtpServer, fromEmail, toEmail) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(25, smtpServer);
    let exists = false;
    let error = null;

    client.setEncoding("utf8");

    client.on("connect", () => {
      client.write(`HELO example.com\r\n`);
      client.write(`MAIL FROM:<${fromEmail}>\r\n`);
      client.write(`RCPT TO:<${toEmail}>\r\n`);
      client.write(`QUIT\r\n`);
    });

    client.on("data", (data) => {
      if (data.includes("450") || data.includes("550")) {
        exists = false;
        error = "Not Exists";
      } else if (data.includes("452") || data.includes("552")) {
        exists = false;
        error = "Out of Storage Space";
      }
    });

    client.on("end", () => {
      if (error) {
        reject({ err: error, exists: exists });
      } else {
        resolve({ exists: true });
      }
    });

    client.on("error", (err) => {
      reject({ err: err, exists: false });
    });
  });
}

module.exports = { resolveMX, sendMailForTest };
