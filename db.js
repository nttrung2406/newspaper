// import mongoose from 'mongoose';

// const connectMongoDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_DB_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log(`MongoDB connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         process.exit(1);
//     }
// };

// export default connectMongoDB;

import mongoose from "mongoose";

export default async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
}
