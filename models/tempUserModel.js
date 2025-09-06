import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

// Define the user schema
const TempUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 10 * 60
    }
});

TempUserSchema.plugin(passportLocalMongoose);
export const TempUser = mongoose.model("tempUser", TempUserSchema);
