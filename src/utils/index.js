const dns = require("dns");
const net = require("net");

// Function to validate email syntax
function isValidEmailSyntax(email) {
  const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return regex.test(email);
}

// Function to validate domain
function checkDomain(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || addresses.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Function to validate SMTP
function checkSMTP(email) {
  return new Promise((resolve, reject) => {
    const domain = email.split("@")[1];
    dns.resolveMx(domain, (err, addresses) => {
      if (err || addresses.length === 0) {
        resolve(false);
        return;
      }

      const exchange = addresses[0].exchange;
      const socket = net.createConnection(25, exchange);

      socket.on("connect", () => {
        socket.write(`HELO ${domain}\r\n`);
        socket.write(`MAIL FROM:<test@${domain}>\r\n`);
        socket.write(`RCPT TO:<${email}>\r\n`);
        socket.write("QUIT\r\n");
      });

      socket.on("data", (data) => {
        const response = data.toString();
        if (response.includes("250")) {
          resolve(true);
        } else {
          resolve(false);
        }
        socket.end();
      });

      socket.on("error", () => {
        resolve(false);
      });
    });
  });
}

module.exports = { isValidEmailSyntax, checkDomain, checkSMTP };
