import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

// Define the user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email should be unique']
    }
});

userSchema.plugin(passportLocalMongoose);
export const User = mongoose.model("User", userSchema);
