const fs = require("fs");
const csv = require("csv-parser");

const inputCsvFile = "../../files/14k-email-kh.csv";
const outputJsonFile = "../../files/14k-email-kh.json";

const results = [];

fs.createReadStream(inputCsvFile, { encoding: "utf8" })
  .pipe(
    csv({
      mapHeaders: ({ header }) => header.trim(),
    })
  )
  .on("data", (data) => {
    results.push({
      companyName: data["Ho_ten"]?.trim(),
      gender: data["Danh_xung"]?.trim(),
      email: data["Email"]?.trim(),
      status: "Not Sent",
    });
  })
  .on("end", () => {
    fs.writeFileSync(outputJsonFile, JSON.stringify(results, null, 2));
    console.log("CSV file successfully converted to JSON");
  })
  .on("error", (error) => {
    console.error("Error reading CSV file:", error);
  });
