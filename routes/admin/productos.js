var express = require('express');
var router = express.Router();
var productosModel = require('../../models/productosModel');
var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);

/* GET home page. */
router.get('/', async function (req, res, next) {

    var productos = await productosModel.getProducts();

    productos = productos.map(producto => {
        if (producto.img_id) {
            const imagen = cloudinary.image(producto.img_id, {
                width: 100,
                height: 100,
                crop: 'fill'
            });
            return {
                ...producto,
                imagen
            }
        } else {
            return {
                ...producto,
                imagen: ''
            }
        }
    });

    res.render('admin/productos', {
        layout: 'admin/layout',
        persona: req.session.nombre,
        productos
    });
});

router.get('/agregar', (req, res, next) => {
    res.render('admin/agregar', {
        layout: 'admin/layout'
    })
})

router.post('/agregar', async (req, res, next) => {

    try {

        var img_id = '';
        if (req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id;
        }


        if (req.body.name != "" && req.body.title != "" && req.body.description != "" && req.body.stock != "" && req.body.price != "") {

            await productosModel.insertProducts({
                ...req.body,
                img_id
            });


            res.redirect('/admin/productos')


        } else {
            res.render('admin/agregar', {
                layout: 'admin/layout',
                error: true, message: 'Todos los campos son requeridos'
            })
        }
    } catch (error) {
        console.log(error)
        res.render('admin/agregar', {
            layout: 'admin/layout',
            error: true, message: 'No se cargó el producto'
        })
    }
})

router.get('/eliminar/:id', async (req, res, next) => {
    var id = req.params.id;

    let prod = await productosModel.getProductsById(id);
    if (prod.img_id) {
        await (destroy(prod.img_id));
    }


    await productosModel.deleteProductsById(id);
    res.redirect('/admin/productos')
});

router.get('/modificar/:id', async (req, res, next) => {

    let id = req.params.id;
    let prod = await productosModel.getProductsById(id);
    res.render('admin/modificar', {
        layout: 'admin/layout',
        prod
    })
})

router.post('/modificar', async (req, res, next) => {
    try {
        let img_id = req.body.img_original;
        let borrar_img_vieja = false;
        if (req.body.img_delete === "1") {
            img_id = null;
            borrar_img_vieja = true;
        } else {
            if (req.files && Object.keys(req.files).lenght > 0) {
                imagen = req.files.imagen;
                img_id = (await uploader(imagen.tempFilePath)).public_id;
                borrar_img_vieja = true;
            }
        }
        if (borrar_img_vieja && req.body.img_original) {
            await (destroy(req.body.img_original));
        }

        let obj = {
            name: req.body.name,
            title: req.body.title,
            description: req.body.description,
            stock: req.body.stock,
            price: req.body.price,
            img_id,
        }

        await productosModel.modifyProductsById(obj, req.body.id);
        res.redirect('/admin/productos');
    }
    catch (error) {
        console.log(error)
        res.render('admin/modificar', {
            layout: 'admin/layout',
            error: true, message: 'No se modificó el producto'
        })
    }
})

module.exports = router;