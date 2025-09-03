import { listingSchema, reviewSchema } from './utils/schema.js';
import { ExpressError } from './utils/expressError.js';
import { listing } from './models/listingsModel.js';
import { review } from './models/reviewModel.js';
import { OTP } from './models/otpModel.js';

//validate listing
export const validateListing = (req, res, next) => {
    let result = listingSchema.validate(req.body);
    // console.log(result);
    let { error } = result;
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    } else if (
        req.method === 'POST' &&
        (!req.file && (!req.files || (Array.isArray(req.files) && req.files.length === 0)))
    ) {
        throw new ExpressError(400, 'Image is required for creating a listing');
    } else {
        next();
    }
};

//validate review
export const validateReview = (req, res, next) => {
    let result = reviewSchema.validate(req.body);
    let { error } = result;
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    } else {
        next();
    }
};

//validate user otp
export const validateOtp = (req, res, next) => {

}

//check if user is logged in
export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectTo = req.originalUrl;
        req.flash('error', 'You must be logged in to do that!');
        return res.redirect('/login');
    }
    next();
};

export const redirectTo = (req, res, next) => {
    if (req.session.redirectTo) {
        res.locals.redirectTo = req.session.redirectTo;
        delete req.session.redirectTo;
        return next();
    }
    res.locals.redirectTo = "/listings";
    next();
};

export const isOwner = async (req, res, next) => {
    let id = req.params.id;
    let currListing = await listing.findById(id);
    if (!currListing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }
    // currListing.owner may be an ObjectId or a populated object. Compare against the owner id directly.
    if (req.user._id.equals(currListing.owner)) {
        return next();
    }
    req.flash('error', 'You do not have permission to do that!');
    res.redirect(`/listings/${id}`);
};

export const isAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let currReview = await review.findById(reviewId);
    if (!currReview) {
        req.flash('error', 'Review not found');
        return res.redirect(`/listings/${id}`);
    }
    // currReview.author may be an ObjectId or populated. Compare directly to avoid accessing undefined._id
    if (req.user._id.equals(currReview.author)) {
        return next();
    }
    req.flash('error', 'You do not have permission to do that!');
    res.redirect(`/listings/${id}`);
};

export async function requireOtpSession(req, res, next) {
    if (req.user) {
        req.flash('error', 'You already logged in');
        return res.redirect('/');
    }
    if (!req.session.verificationId) {
        req.flash('error', 'Invalid request');
        return res.redirect('/signup');
    }
    if(!(await OTP.findById(req.session.verificationId))){
        req.flash('error', 'Invalid request');
        return res.redirect('/signup');
    }
    next();
}
