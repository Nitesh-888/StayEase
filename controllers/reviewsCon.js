import { listing } from '../models/listingsModel.js';
import { review } from '../models/reviewModel.js';

export const addReview = async (req, res) => {
    let currListing = await listing.findById(req.params.id);
    let newReview = new review(req.body);
    newReview.author = req.user._id; // Set the author to the current user

    currListing.reviews.push(newReview);

    await newReview.save();
    await currListing.save();
    console.log(req.body);
    req.flash("success", "New Review added Successfully!")
    res.redirect(`/listings/${req.params.id}`)
};

export const deleteReview = async (req, res) => {
    let {id, reviewId} = req.params;
    await review.findByIdAndDelete(reviewId);
    await listing.updateOne({_id : id}, {$pull : {reviews : reviewId}});
    req.flash("success", "Review Deleted!")
    res.redirect(`/listings/${id}`);

};