const axios = require("axios");

function createTag(cardData) {
    let tagPieces = [cardData.card_name];

    let setCode = cardData.set_code;
    if (cardData.extended_art) {
        tagPieces.push("-");    
        tagPieces.push(cardData.variant);
        if (cardData.extended_art_modifier == "Scene") {
           tagPieces.push("Scene");
        }
    } else if (cardData.promo) {
        tagPieces.push("-");
        tagPieces.push("Promo Pack");
        setCode = "P" + setCode;
    } else if (cardData.list) {
        tagPieces.push("-");
        tagPieces.push(cardData.set_code);
        tagPieces.push("Reprint");
        setCode = "PLST";
    }

    if (cardData.foil) {
        tagPieces.push("(Foil)");
    }
    tagPieces.push(`(${setCode})`);
    return tagPieces.join(" ").toLowerCase();
}

async function fetch(cardData) {
    const url = "https://buylist.401games.ca/saas/search";

    let cardTag = createTag(cardData);
    let queryParams = {
        store_id: "USYSFNJ9bg",
        product_line: "Magic: the Gathering",
        mongo: true,
        sort: "Relevance",
        buylist_products: true,
        name: cardTag,
    }
    let response = await axios.get(url, { params: queryParams })

    let productResponse = response.data.products?.[0];
    let value = productResponse?.display_name?.toLowerCase() == cardTag ? productResponse.offer_price : 0;
    return value;
}

module.exports =  {
    fetch
};