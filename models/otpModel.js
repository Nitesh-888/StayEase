import mongoose, { mongo } from "mongoose";

const optSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email should be unique']
    },
    username: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: [true, 'Verification code required']
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60
    }
})

export const OTP = mongoose.model("OTP", optSchema);