const express = require('express');
const app = express();
require('dotenv').config({ path: './config/env/development.env' });

app.set('view engine', 'ejs');

const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());  
app.use('/admin', authMiddleware); 

//app.use('/articles', articleRoutes);  
//app.use('/users', userRoutes);        
//app.use('/admin', adminRoutes);       
//app.use(errorHandler);

app.use('/assets',express.static(__dirname + "/public"));
app.use('/', express.static(__dirname + "/views"));

app.get("/", (req, res) =>{
    res.render('index')
})

app.get('/categori', (req, res) => {
    res.render('categori'); 
});

app.get('/about', (req, res) => {
    res.render('about'); 
});

app.get('/latest_news', (req, res) => {
    res.render('latest_news'); 
});

app.get('/contact', (req, res) => {
    res.render('contact'); 
});

app.get('/elements', (req, res) => {
    res.render('elements'); 
});

app.get('/blog', (req, res) => {
    res.render('blog'); 
});

app.get('/single-blog', (req, res) => {
    res.render('single-blog'); 
});

app.get('/details', (req, res) => {
    res.render('details'); 
});

app.listen(3300, () => {
    console.log('Server is running on port 3300');
});
