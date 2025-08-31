import express from 'express';
import path from 'path';
import mongoose, { Query } from 'mongoose';

import methodOverride from 'method-override';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ejsMate = require('ejs-mate');
import { ExpressError } from './utils/expressError.js';
import listingsRoute from './routes/listings.js'
import userRoute from './routes/user.js';
import apiRoute from './routes/api.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import MongoStore from 'connect-mongo';

//importing passport
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { User } from './models/userModel.js';

const app = express();
const __dirname = './';
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + 'public')));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate);
app.use(cookieParser());
app.use(session({
    secret:process.env.SESSION_SECRET_CLIENT,
    resave:false,
    saveUninitialized:false,
    cookie: {
        maxAge: 7*24*60*60*1000
    },
    store: MongoStore.create({
        mongoUrl: process.env.ATLAS_DB_URL,
        touchAfter: 24*3600,
        cryto: {
            secret : process.env.SESSIOIN_SECRET_SERVER
        }
    })
}));
app.use(flash());

//passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    next();
});

app.listen(process.env.PORT, ()=> {
    console.log("server is running");
});



//database
main()
    .then(()=> console.log('connected to mongoDB'))
    .catch((err)=>console.log(err));

async function main() {
    return mongoose.connect(process.env.ATLAS_DB_URL);
};
//home Route
app.use("/", userRoute);


//listing route
app.use('/listings', listingsRoute);

//api route
app.use('/api', apiRoute);

//page not found
app.all('*', (req, res, next) => {
    next(new ExpressError(404, "The page you're looking for doesn't exist."));
});


//error handler
app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong"} = err;
    console.log(statusCode, message);
    console.log(err);
    res.status(statusCode);
    res.render('error', {statusCode, message});
});
