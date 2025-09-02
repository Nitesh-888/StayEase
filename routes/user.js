import express from "express";
import passport from "passport";
import { redirectTo, requireOtpSession } from "../middlewares.js";
import { homePage, signup, login, signupForm, loginForm, logout, otpPage, verifyOtp } from "../controllers/usersCon.js";
import { wrapAsync } from "../utils/wrapAsync.js";

const app = express();

const router = express.Router();

router.get("/", homePage);

// sign up route
router.route("/signup")
    .get(signupForm)
    .post(wrapAsync(signup));

router.get('/auth', requireOtpSession, otpPage);
router.post('/verify-otp', wrapAsync(verifyOtp));

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
