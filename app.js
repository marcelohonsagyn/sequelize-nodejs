const express = require('express')
const app = express();
const mustacheExpress = require('mustache-express');
const path = require('path');
const bodyParser = require('body-parser');
const models = require('./models');
const session = require('express-session');
const mainRoute = require('./routes/mainRoute');
const productRoute = require('./routes/productRoute');
const checkAuthorization = require('./middleware/authorization');

//Variables
const PORT = 80;
const SALT_ROUNDS = 10;
const VIEWS_PATH = path.join(__dirname, 'views');
global.__basedir = __dirname;

app.use(session({
    secret: 'asdfadfadf',
    resave: true,
    saveUninitialized: false,
}));

//static folder
app.use('/uploads', express.static('uploads'));
app.use('/css', express.static('css'));

app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    res.locals.isAuthenticated = false;
    next();
})

//Configurations
app.engine('mustache', mustacheExpress(VIEWS_PATH + '/partials', '.mustache'));
app.set('views', VIEWS_PATH);
app.set('view engine', 'mustache');

//Routes
app.use('/', mainRoute);
app.use('/products', checkAuthorization, productRoute);

//Starter
app.listen(PORT, () => {
    console.log('Server is Running');
});
