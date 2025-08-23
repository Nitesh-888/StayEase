import mongoose from "mongoose"
import { review } from "./reviewModel.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { cloudinary } from "../cloudConfig.js";

const listSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    price : {
        type : Number,
        required : true,
        min : 0
    }, 
    description : {
        type : String,
    },
    image : {
        url : {
            type : String,
            required: true,
        },
        filename : {
            type : String,
            required: true,
        }
    },
    location : {
        type : String,
        required: true
    },
    country : {
        type : String,
        required: true
    },
    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "review"
        }
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
    geometry : {
        type : {
            type : String,
            enum : ['Point'],
            required : true
        },
        coordinates : {
            type : [Number],
            required : true
        }
    }
});

listSchema.post('findOneAndDelete', async (deletedListing) => {
    try{
        if(deletedListing){
            await review.deleteMany({_id : {$in : deletedListing.reviews}});
            await cloudinary.uploader.destroy(deletedListing.image.filename, {invalidate : true});
        }
    }catch(err){
        console.log(err);
    }
    

});

export const listing = mongoose.model('listing', listSchema);

