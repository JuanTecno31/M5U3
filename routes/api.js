var express = require('express');
var router = express.Router();
var productosModel = require('./../models/productosModel');
var cloudinary = require('cloudinary').v2;


router.get('/productos', async function (req, res, next) {
    let prod = await productosModel.getProducts();

    prod = prod.map(prod => {
        if (prod.img_id) {
            const imagen = cloudinary.url(prod.img_id, {
                width: 960,
                height: 200,
                crop: 'fill'
            })
            return {
                ...prod,
                imagen
            }
        } else {
            return {
                ...prod,
                imagen: ''
            }
    }
    })
res.json(prod);
})

module.exports = router;