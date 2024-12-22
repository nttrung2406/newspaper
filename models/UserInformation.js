import mongoose from "mongoose"

const userInformationSchema = new mongoose.Schema(
    {
      accountID: {type: mongoose.Types.ObjectId, required:true , unique: true, ref: "User"},
      fullname: {type: String, required: true},
      dateOfBirth: {type: Date, required: true},
      penName: { type: [String], default: null }
    }
  )

  const UserInformation = mongoose.model("User_information", userInformationSchema)

  export default UserInformation