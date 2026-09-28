const csvtojson = require("csvtojson");
const face = require("./integrations/face");
const four01games = require("./integrations/401games");

const csvFilePath = process.argv[2];

const validateRow = (row, index) => {
  const requiredKeys = ["card_name", "set_name", "set_code"];

  for (const key of requiredKeys) {
    if (!(key in row)) {
      throw new Error(`Row ${index + 1} is missing required field: ${key}`);
    }
  }

  if (row.card_name.trim() === "") {
    throw new Error(
      `Row ${index + 1} field "card_name" must be a non-empty string, got ${JSON.stringify(row.card_name)}`
    );
  }

  if (row.set_name.trim() === "") {
    throw new Error(
      `Row ${index + 1} field "set_name" must be a non-empty string, got ${JSON.stringify(row.set_name)}`
    );
  }

  if (row.set_code.trim() === "") {
    throw new Error(
      `Row ${index + 1} field "set_code" must be a non-empty string, got ${JSON.stringify(row.set_code)}`
    );
  }

  return row;
};

function stringifyCsv(rows) {
  const headers = Object.keys(rows[0]);

  return [
    headers.join(",").replace("four01games_price", "401games_price"),
    ...rows.map((row) => headers.map((header) => row[header]).join(",")),
  ].join("\n");
}

if (!csvFilePath) {
  console.error("Usage: node index.js <csv-file-path>");
  process.exit(1);
}

csvtojson()
  .fromFile(csvFilePath)
  .then((rows) => {
    const validatedRows = rows.map(validateRow);
    console.error(JSON.stringify(validatedRows, null, 2));

    console.error("Fetching prices...");
    return Promise.all(validatedRows.map(async (row) => {
      try {
        row.face_price = await face.fetch(row);
      } catch (error) {
        console.error(`Error fetching price for ${row.card_name} from Face to Face Games:`, error.message);
      }

      try {
        row.four01games_price = await four01games.fetch(row);
      } catch (error) {
        console.error(`Error fetching price for ${row.card_name} from 401 Games:`, error.message);
      }

      return row;
    }))
    .then((updatedRows) => {
      console.error("Updated rows with prices:");
      console.log(stringifyCsv(updatedRows));
    })
  })
  .catch((error) => {
    console.error("Error reading CSV file:", error.message);
    process.exit(1);
  });

