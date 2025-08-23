import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    comment : String, 
    rating : {
        type : Number, 
        min : 1,
        max : 5
    },
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
}, {timestamps : true});


export const review = mongoose.model('review', reviewSchema);