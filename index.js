const csvtojson = require("csvtojson");
const face = require("./integrations/face");
const four01games = require("./integrations/401games");

const csvFilePath = process.argv[2];

const validateRow = (row, index) => {
  const requiredKeys = ["card_name", "tag_face", "tag_401games"];

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

  return {
    card_name: row.card_name,
    tags: {
        face: row.tag_face == "" ? null : row.tag_face,
        "401games": row["tag_401games"] == "" ? null : row["tag_401games"]
    }
  };
};

if (!csvFilePath) {
  console.error("Usage: node index.js <csv-file-path>");
  process.exit(1);
}

csvtojson()
  .fromFile(csvFilePath)
  .then((rows) => {
    const validatedRows = rows.map(validateRow);
    console.log(JSON.stringify(validatedRows, null, 2));

    console.log("Fetching prices from Face to Face Games...");
    validatedRows.forEach(async (row) => {
      try {
        const price = await face.fetch(row.tags.face);
        console.log(`Price for ${row.card_name} from Face to Face Games: $${price}`);
      } catch (error) {
        console.error(`Error fetching price for ${row.card_name} from Face to Face Games:`, error.message);
      }
    });

    console.log("Fetching prices from 401 Games...");
    validatedRows.forEach(async (row) => {
      try {
        const price = await four01games.fetch(row.tags["401games"]);
        console.log(`Price for ${row.card_name} from 401 Games: $${price}`);
      } catch (error) {
        console.error(`Error fetching price for ${row.card_name} from 401 Games:`, error.message);
      }
    });
  })
  .catch((error) => {
    console.error("Error reading CSV file:", error.message);
    process.exit(1);
  });

