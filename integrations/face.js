const axios = require("axios");
const cheerio = require("cheerio");

let tokenData = null;

async function fetch(cardName) {
    if (!tokenData) {
        let tokenResponse = await axios.post("https://facetofacegames.com/cart/update.js", {
            attributes: {
                site: "sell"
            }
        })
        tokenData = tokenResponse.data;
    }

    const url = `https://facetofacegames.com/products/${cardName}`;
    let response = await axios.get(url, { headers: {
        'cookie': `cart=${tokenData.token}`,
    } });
    let $ = cheerio.load(response.data)
    const price = parseFloat($(".f2f-featured-variant")
        .first()
        .find(".price__regular")
        .first()
        .find(".price-item")
        .first()
        .text()
        .trim()
        .substring(1)
    );

    return price;
}

module.exports = {
    fetch
};