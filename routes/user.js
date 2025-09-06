import express from "express";
import passport from "passport";
import { redirectTo, requireOtpSession, validateOtp } from "../middlewares.js";
import { homePage, signup, login, signupForm, loginForm, logout, resendOtp, forgotPassPage, sendOtp, forgotPassOtpVerify, verifyOtpForRes, otpPageForRes, setPassPage, forgotPassOtpPage, updatePassword } from "../controllers/usersCon.js";
import { wrapAsync } from "../utils/wrapAsync.js";

const app = express();

const router = express.Router();

router.get("/", homePage);

// sign up route
router.route("/signup")
    .get(signupForm)
    .post(wrapAsync(signup));

router.get('/auth', wrapAsync(requireOtpSession('/signup')), wrapAsync(otpPageForRes));
router.post('/auth/verify-otp', wrapAsync(validateOtp('/auth', '/signup')), wrapAsync(verifyOtpForRes));
router.get('/auth/resend-otp', wrapAsync(requireOtpSession('/signup')), wrapAsync(resendOtp('/auth', '/signup')));

router.get('/auth/forgot-password', forgotPassPage);
router.get('/auth/forgot-password/otp-page', wrapAsync(requireOtpSession('/auth/forgot-password')), wrapAsync(forgotPassOtpPage));
router.post('/auth/forgot-password/send-otp', wrapAsync(sendOtp));
router.get('/auth/forgot-password/resend-otp', wrapAsync(requireOtpSession('/auth/forgot-password')), wrapAsync(resendOtp('/auth/forgot-password/otp-page', '/auth/forgot-password')));
router.post('/auth/forgot-password/verify-otp', wrapAsync(validateOtp('/auth/forgot-password/otp-page', '/auth/forgot-password')), wrapAsync(forgotPassOtpVerify));
router.get('/auth/forgot-password/set-password/:updateId', wrapAsync(requireOtpSession('/auth/forgot-password')), setPassPage);
router.post('/auth/forgot-password/update-password/:updateId', wrapAsync(requireOtpSession('/auth/forgot-password')), wrapAsync(updatePassword));

// login routes
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
