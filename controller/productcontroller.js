const Products = require("../routes/products")

module.exports = {
    getProducts: async (req, res, next) => {
        const products = await Products.find()
        res.Json(products)
    }
}