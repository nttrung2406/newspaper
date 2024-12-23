import mongoose from 'mongoose';

const UserInformationSchema = new mongoose.Schema({
    accountID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    penName: {
        type: String,
        default: null
    }
});

const UserInformation = mongoose.model('User_information', UserInformationSchema);
export default UserInformation;