import { User } from "../models/userModel.js";
import { OTP } from "../models/otpModel.js"
import sendMail from "../utils/emailConfig.js"
import { TempUser } from "../models/tempUserModel.js";

export const homePage = (req, res) => {
    res.render('home');
};

export const signupForm = (req, res) => {
    res.render('users/signup');
};

export const otpPage = async (req, res) => {
    let otpDoc = await OTP.findById(req.session.verificationId);
    res.render('users/otpPage', { email: otpDoc.email });
}

export const verifyOtp = async (req, res, next) => {
    if (req.user) {
        req.flash('error', 'You already logged in');
        return res.redirect('/');
    }
    let { otp } = req.body;
    if (!otp) {
        req.flash('error', 'Please enter otp');
        return res.redirect('/auth');
    }
    let verificationId = req.session.verificationId;
    if (!verificationId) {
        req.flash('error', 'Invalid request');
        return res.redirect('/');
    }
    let otpDoc = await OTP.findById(verificationId);
    if (!otpDoc) {
        req.flash('error', 'Otp you entered is invalid or expired');
        return res.redirect('/signup');
    }
    let tempUser = await TempUser.findOne({ email: otpDoc.email }).select("+hash +salt");
    //logically user not exist is not possible but checking for formality
    if (!tempUser) {
        req.flash('error', 'User not found or Already verified');
        return res.redirect('/signup');
    }

    if (otp == otpDoc.otp) {
        await OTP.findByIdAndDelete(verificationId);
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
    await OTP.findOneAndDelete({ email: email })

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
    const otp = Math.floor(Math.random() * 900000 + 100000);
    const newUserOtp = new OTP({ email, username, otp });
    await newUserOtp.save();
    await sendMail({ email, username, otp });
    req.session.verificationId = newUserOtp._id.toString();
    res.redirect('/auth');
};

export const resendOtp = async (req, res) => {
    let otpDoc = await OTP.findById(req.session.verificationId);
    if (!otpDoc) {
        req.flash('error', 'Verification session is Expired, try again!');
        return res.redirect('/signup');
    }
    const otp = Math.floor(Math.random() * 900000 + 100000);
    let { email, username } = otpDoc;
    otpDoc.otp = otp;
    otpDoc.save();
    await sendMail({ email, username, otp });
    res.redirect('/auth');
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