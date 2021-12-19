const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./Models/User');
const bcrypt = require('bcrypt');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const port = process.env.PORT || 5000;

const database = process.env.MONGOURI;

mongoose.connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
}).then(() => {
    console.log('mongoose connected');
}).catch((err) => console.log(err))

// function to create json web token
const createjwt = (id) => {
    return jwt.sign({id}, 'secretkey', {
        expiresIn: 24*60*60
    });
}

// user signup using a POST request
app.post('/signup', async (req,res) =>{
    const {email, username,contact, password} = req.body;
    try{
        const user = await User.create({email, username, contact, password});
        const token = createjwt(user._id);
        res.cookie('jwt', token, {
            maxAge: 1000*24*60*60
        });
        res.status(201).json(token);
    }
    catch(err){
        console.log(err);
        res.status(400).send('error, user not created');
    }
    
})

// Login user with email & password and return jwt on success
app.post('/login', async (req, res) =>{
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(user){
            const auth = await bcrypt.compare(password, user.password);
            if(auth){
                const token = createjwt(user._id);
                res.cookie('jwt', token, {
                    maxAge: 1000*24*60*60
                });
                res.status(200).json(token);
                console.log(user);
            }else{
                res.send('incorrect password');
            }
        }else{ 
        res.send('incorrect email');
        }
    }catch (err){
        console.log(err);
        res.status(400).send('there is some problem logging in');
    }
})

// get request for fetching user details from his token
app.get('/user-details', (req, res) =>{
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'secretkey', async (err, decodedToken) =>{
            if(err){
                console.log(err.message);
                res.send('error verifying the token');
            }else{
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                console.log(user);
                res.send(user);
            }
        })
    }else{
        res.send('user not logged in');
    }
})

app.listen(port,()=>{
    console.log(`server is running on the port ${port}`);
});