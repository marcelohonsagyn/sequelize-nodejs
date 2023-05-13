const express = require('express');
const crypto = require('crypto');
const models = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
    let products = await models.Product.findAll();
    res.render('index', { products: products});

});

router.post('/register', async (req, res) => {
    var user = req.body;
    let existingUser = await models.User.findOne({
        where: {
            username: user.username
        }
    });

    if (existingUser == null) {
        let hash = crypto.createHash('md5').update(user.password).digest("hex"); 
        user.password = hash; 
        let userModel = await models.User.build(user);
        let userSaved = await userModel.save();
        res.render('login', {message: `User ${userSaved.username} registered with success.`});
    } else {
        res.render('register', {error: `There is a user with the username ${user.username}`});
    }

});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/login', async (req, res) => {
    let user = req.body;
    let existingUser = await models.User.findOne({
        where: {
            username: user.username
        }
    });

    if (!existingUser) {
        res.render('login', { error: `There is no user with username ${user.username}`});
        return;
    } else {
        let hash = crypto.createHash('md5').update(user.password).digest("hex");  
        if (hash !== existingUser.password) {
            res.render('login', { error: `Invalid Credentials!`});
            return;
        } else {
            if (req.session) {
                req.session.user = { userId: existingUser.id};
                res.redirect('/products');
            } else {
                res.render('login', { error: `Invalid Session!`});
            }
        }
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                next(error);
            } else {
                res.redirect('/login');
            }
        })
    }
})

router.get('/products/comments/:id', async (req, res) => {
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
    res.render('products/product-details', product.dataValues);
});

router.post('/add-comment', async (req, res) => {
    let comment = req.body;
    let commentModel = await models.Comment.build(comment);
    let commentSaved = await commentModel.save();
    if (commentSaved) {
        res.redirect(`/products/comments/${commentSaved.productId}`);
    } else {
        res.render('product-details', { error: "We cant save the comment."});
    }
    
});

router.get('/comments/:id', async (req, res) => {
    let commentId = req.params.id;
    let comment = await models.Comment.findOne({
        include: [
            {
                model: models.Product,
                as: 'product'
            }
        ],
        where: {
            id: commentId
        }
    });

    res.json(comment);
});
module.exports = router;