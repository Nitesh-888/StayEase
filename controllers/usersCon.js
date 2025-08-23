import { User } from "../models/userModel.js";

export const homePage = (req, res) => {
    res.render('home');
};

export const signupForm = (req, res) => {
    res.render('users/signup');
};

export const signup = (req, res) => {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    User.register(newUser, password, (err, user) => {
        if (err) {
            req.flash('error', err.message);
            console.log(err);
            return res.redirect('/signup');
        }
        req.login(user, (err) => {
            if(err) {
                return next(err);
            }
            req.flash('success', 'Account created successfully!');
            res.redirect('/');
        })
    });
};

export const loginForm = (req, res) => {
    res.render('users/login');
};

export const login = (req, res) => {
    req.flash('success', 'Logged in successfully!');
    res.redirect(res.locals.redirectTo);
};

export const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out successfully!');
        res.redirect('/');
    });
};