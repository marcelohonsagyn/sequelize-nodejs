const express = require('express');
const formidable = require('formidable'); 
const fs = require('node:fs');
const path = require('path');
const { v1 } = require('uuid');
const router = express.Router();
const models = require('../models');

let uniqueFileName = '';
 
router.get('/add-product', async (req, res) => {
    res.render('products/add-product');
});

const upload = async (req, res) => {
    try {
            const uploadDir = path.join(__basedir + '/uploads');
            const id = req.params.id;
            var viewReturn = "";
            //if there is a id, return to edit page, else, return to add page
            if (id) {
                viewReturn = 'products/edit-product';
            } else {
                viewReturn = 'products/add-product';
            }
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, '0777', true);
            }

            const filterFunction = ({ name, originalFilename, mimetype }) => {
                if (!(originalFilename && name)) {
                    return 0;
                }
                
                // return mimetype && mimetype.includes("image"); uncomment for uploading only image file
                return 1;  
            };

            const customOptions = { uploadDir: uploadDir, keepExtensions: true, allowEmptyFiles: false, maxFileSize: 5 * 1024 * 1024 * 1024, multiples: true, filter: filterFunction };
            const form = new formidable.IncomingForm(customOptions);

            form.parse(req, async (err, field, file) => {
                if (err) {
                throw err;
            }

            if (!file.myFiles) {
                res.render(viewReturn, {error: 'No file Selected' });
            }
            
            uniqueFileName =  v1() + '.' + file.myFiles.originalFilename.split(`.`).pop();
            const newFilepath = `${uploadDir}/${uniqueFileName}`;
            fs.rename(file.myFiles.filepath, newFilepath, err => err);

            //if there is a id, update the image
            if (id) {
                let id = req.params.id;
                 await models.Product.update({
                                            imageURL: uniqueFileName
                                        },
                                        {
                                            where: {
                                                id: parseInt(id)
                                            }
                                        });
                let product = await models.Product.findByPk(id)
                res.render(viewReturn, product.dataValues);
            } else {
                res.render(viewReturn, {imageURL:'/uploads/' + uniqueFileName,
                className: 'product-preview-image' });
            }

            
            
        });

    } catch (err) {
        res.render(viewReturn, {error: 'Error occured'});
    }

}

router.post('/upload',  upload);

router.post('/add-product', async (req, res) => {
     
    let product = models.Product.build({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        userId: req.session.user.userId,
        imageURL: uniqueFileName
    })

   let productSaved = await product.save();
   if (productSaved != null) {
    res.render('products/add-product', {message: `Product ${product.title} added with success`});
   } else {
    res.render('products/add-product', {error: `We cant save the Product ${product.title}`});
   }

    
});

router.get('/', async (req, res) => {
   
    let products = await models.Product.findAll();
    res.render('products/products', { products: products});

});

router.post('/delete-product', async (req, res) => {
    let productId = req.body
    const product = await models.Product.findOne({ id: productId});
    if (!product) {
        res.render('products/products', { error: 'We cant find a product'});
    } else {
        await product.destroy();
        res.render('products/products', {message: `The product ${product.title} was deleted!`});
    }

});

router.get('/:id', async (req, res) => {
    let id = req.params.id;
    let product = await models.Product.findOne({
        include: [
            {
                model: models.Comment,
                as: 'comments'
            }
        ],
        where : {
            id: id
        }
    });
    res.render('products/edit-product', product.dataValues);
});

router.post('/upload/edit-image/:id', upload);

router.post('/edit', async (req, res) => {

    const id = req.body.id;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;

    await models.Product.update({
        title: title,
        description: description,
        price: parseFloat(price)
    },
    {
        where: {
            id: parseInt(id)
        }
    });

    res.redirect('/products');

});

module.exports = router;