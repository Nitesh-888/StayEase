import { User } from "../models/userModel.js";
import { OTP } from "../models/otpModel.js"
import sendMail from "../utils/emailConfig.js"
import { TempUser } from "../models/tempUserModel.js";
import { createOtp } from "../middlewares.js";
import { v4 as uuid4 } from "uuid";

export const homePage = (req, res) => {
    res.render('home');
};

export const signupForm = (req, res) => {
    res.render('users/signup');
};

export const otpPageForRes = async (req, res) => {
    let otpDoc = await OTP.findById(req.session.verificationId);
    let remTime = 60*1000-(Date.now()-otpDoc.createdAt);
    res.render('users/otpPage', { email: otpDoc.email , remTime: remTime, submitUrl: '/auth/verify-otp', resendOtpUrl: '/auth/resend-otp'});
}

export const verifyOtpForRes = async (req, res, next) => {
    let { otp } = req.body;
    let otpDoc = await OTP.findById(req.session.verificationId);
    let tempUser = await TempUser.findOne({ email: otpDoc.email }).select("+hash +salt");
    //logically user not exist is not possible but checking for formality
    if (!tempUser) {
        req.flash('error', 'User not found or Already verified');
        return res.redirect('/signup');
    }

    if (otp == otpDoc.otp) {
        await OTP.findByIdAndDelete(req.session.verificationId);
        let tempUserObj = tempUser.toObject();
        const { hash, salt, username, email, ...rest } = tempUserObj;
        const user = new User({ username, email, hash, salt });
        await user.save();
        await tempUser.deleteOne();
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Account created successfully!');
            res.redirect('/');
        })
    } else {
        req.flash('error', 'Invalid OTP');
        return res.redirect('/auth');
    }
}

export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    //deleting previous document that have same username or email with curr user.
    //because it does not register duplicate username or email
    await TempUser.findOneAndDelete({ username: username });
    await TempUser.findOneAndDelete({ email: email });

    //at a time we hold only one otp for a unique email. so we have delete if any otp is already present in OTP model with same email
    await OTP.findOneAndDelete({ email: email });

    //check if any user is register with the curr user's username or email 
    if (await User.findOne({ username: username })) {
        req.flash('error', 'username is already take, Please use a different username');
        return res.redirect('/signup');
    }
    if (await User.findOne({ email: email })) {
        req.flash('error', 'Email already registered. Please use a different email.');
        return res.redirect('/signup');
    }

    const newTempUser = new TempUser({ username, email });
    TempUser.register(newTempUser, password, (err, user) => {
        if (err) {
            req.flash('error', err.message);
            console.log(err);
            return res.redirect('/signup');
        }
    });
    const otp = createOtp();
    const newUserOtp = new OTP({ email, username, otp });
    await newUserOtp.save();
    await sendMail({ email, username, otp });
    req.session.verificationId = newUserOtp._id.toString();
    res.redirect('/auth');
};

export const resendOtp = (currUrl, redirectUrl) => {
    return async (req, res) => {
        let otpDoc = await OTP.findById(req.session.verificationId);
        if (!otpDoc) {
            req.flash('error', 'Verification session is Expired, try again!');
            return res.redirect(redirectUrl);
        }

        if (Date.now() - otpDoc.createdAt < 60 * 1000) {
            req.flash("error", "Please wait before requesting a new OTP.");
            return res.redirect(currUrl);
        }

        const otp = createOtp();
        let { email, username } = otpDoc;
        otpDoc.otp = otp;
        otpDoc.createdAt = Date.now();
        otpDoc.save();
        await sendMail({ email, username, otp });
        res.redirect(currUrl);
    }
}

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

export const forgotPassPage = (req, res) => {
    res.render('users/forgotPassword')
};

export const sendOtp = async (req, res) => {
    let { email } = req.body;
    if(!email) {
        req.flash('error', 'Please enter email');
        return res.redirect('/auth/forgot-password');
    }

    let user = await User.findOne({email : email});
    if(!user){
        req.flash('error', 'Email is not registered');
        return res.redirect('/auth/forgot-password');
    }

    let otpDoc = await OTP.findOne({ email: email });
    if(otpDoc){
        if (Date.now() - otpDoc.createdAt < 60 * 1000) {
            req.flash("error", "Please wait before requesting a new OTP.");
            return res.redirect('/auth/forgot-password/otp-page');
        }
        await otpDoc.deleteOne();
    }

    let username = user.username;
    let otp = createOtp();
    await sendMail({email, username, otp});

    const newUserOtp = new OTP({ email, username, otp });
    await newUserOtp.save();
    req.session.verificationId = newUserOtp._id.toString();

    return res.redirect('/auth/forgot-password/otp-page');
};

export const forgotPassOtpPage = async (req, res) => {
    let otpDoc = await OTP.findById(req.session.verificationId);
    let remTime = 60*1000-(Date.now()-otpDoc.createdAt);
    return res.render("users/otpPage", { email: otpDoc.email, remTime: remTime, submitUrl: '/auth/forgot-password/verify-otp', resendOtpUrl: '/auth/forgot-password/resend-otp'});
}

export const forgotPassOtpVerify = async (req, res) => {
    let { otp } = req.body;
    let otpDoc = await OTP.findById(req.session.verificationId);
    if (otp == otpDoc.otp) {
        let updateId=uuid4();
        req.session.updateId=updateId;
        req.flash('success', 'Otp verified successfully');
        res.redirect(`/auth/forgot-password/set-password/${updateId}`);
    } else {
        req.flash('error', 'Invalid OTP');
        return res.redirect('/auth/forgot-password/otp-page');
    }
};

export const setPassPage = (req, res) => {
    let {updateId} = req.params;
    res.render('users/setPassPage', {updateId});
};

export const updatePassword = async (req, res, next) => {
    let {updateId}=req.params;
    if(!req.session.updateId || !updateId || req.session.updateId!=updateId){
        req.flash('error', 'something went wrong, Try Again!');
        return res.redirect('/auth/forgot-password');
    }

    console.log(req.body);
    let {newPass, confirmPass} = req.body;
    if(!newPass){
        req.flash('error', 'Please enter new password!');
        return res.redirect(`/auth/forgot-password/set-password/${updateId}`);
    }
    if(!confirmPass){
        req.flash('error', 'Please enter comfirm password!');
        return res.redirect(`/auth/forgot-password/set-password/${updateId}`);
    }
    if (newPass !== confirmPass) {
        req.flash("error", "Passwords do not match");
        return res.redirect(`/auth/forgot-password/set-password/${updateId}`);
    }


    let otpDoc = await OTP.findById(req.session.verificationId);
    let user = await User.findOne({email : otpDoc.email});
    
    if(!user) {
        req.flash('error', 'User Not Found!');
        return res.redirect('/auth/forgot-password');
    }

    await user.setPassword(newPass);
    await user.save();
    req.login(user, (err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Password updated successfully!');
        res.redirect('/');
    })
};