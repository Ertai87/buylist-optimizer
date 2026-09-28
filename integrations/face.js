const axios = require("axios");
const cheerio = require("cheerio");

let tokenData = null;
let requestQueue = Promise.resolve();

function waitForRequestSlot() {
    requestQueue = requestQueue.then(() => new Promise((resolve) => setTimeout(resolve, 2000)));
    return requestQueue;
}

function createTag(cardData) {
    let tagPieces = [cardData.card_name];

    let setName = cardData.set_name;
    if (cardData.list) {
        tagPieces.push(cardData.set_code);
        setName = "the list";
    }

    let cardNumber = cardData.card_number;
    if (cardData.promo?.toLowerCase() == "promo pack") {
        cardNumber += "p";
    } else if (cardData.promo?.toLowerCase() == "prerelease") {
        cardNumber += "s";
    }
    tagPieces.push(`${cardNumber}`);

    if (cardData.variant) {
        tagPieces.push(cardData.variant);
        if (cardData.extended_art_modifier) {
            tagPieces.push(cardData.extended_art_modifier);
        }
    }

    if (cardData.promo) {
        tagPieces.push(cardData.promo);
    }

    tagPieces.push(`${setName}`);

    if (cardData.promo) {
        tagPieces.push("promos");
    }

    if (cardData.foil) {
        tagPieces.push(cardData.foil);
    } else {
        tagPieces.push("non foil");
    }

    return tagPieces.join(" ").replace(/[^a-z0-9 ]/gi, "").replaceAll(" ", "-");
}

async function fetch(cardData) {
    if (!tokenData) {
        await waitForRequestSlot();
        let tokenResponse = await axios.post("https://facetofacegames.com/cart/update.js", {
            attributes: {
                site: "sell"
            }
        })
        tokenData = tokenResponse.data;
    }

    const cardTag = createTag(cardData);
    const url = `https://facetofacegames.com/products/${cardTag}`;
    await waitForRequestSlot();
    let response = await axios.get(url, { headers: {
        'cookie': `cart=${tokenData.token}`,
    } });
    let $ = cheerio.load(response.data)
    let price = parseFloat($(".f2f-featured-variant")
        .first()
        .find(".price__regular")
        .first()
        .find(".price-item")
        .first()
        .text()
        .trim()
        .substring(1)
    );

    if (!price) price = 0;

    return price;
}

module.exports = {
    fetch
};