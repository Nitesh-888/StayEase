import express from "express";
import passport from "passport";
import { redirectTo } from "../middlewares.js";
import { homePage, signup, login, signupForm, loginForm, logout } from "../controllers/usersCon.js";

const app = express();

const router = express.Router();

router.get("/", homePage);

// sign up route
router.route("/signup")
    .get(signupForm)
    .post(signup);

// login route
router.route("/login")
    .get(loginForm)
    .post(redirectTo,
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: true,
        }),
        login
    );

// logout route
router.get("/logout", logout);


export default router;
