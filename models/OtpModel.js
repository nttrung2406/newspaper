import mongoose from "mongoose";


const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    resetCode: { type: String, default: null },
    resetExpires: { type: Date, default: null },
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;