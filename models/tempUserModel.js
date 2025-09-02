import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

// Define the user schema
const TempUserSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 60
    }
});

TempUserSchema.plugin(passportLocalMongoose);
export const TempUser = mongoose.model("tempUser", TempUserSchema);
