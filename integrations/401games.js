const axios = require("axios");

async function fetch(cardName) {
    const url = "https://buylist.401games.ca/saas/search";
    let queryParams = {
        store_id: "USYSFNJ9bg",
        product_line: "Magic: the Gathering",
        mongo: true,
        sort: "Relevance",
        buylist_products: true,
        name: cardName,
    }
    let response = await axios.get(url, { params: queryParams })
    let value = response.data.products?.[0]?.offer_price
    return value;
}

module.exports =  {
    fetch
};