import mongoose from "mongoose";

export const connectDatabase = () => {
    let DB_URI = "";

    if (process.env.NODE_ENV === "DEVELOPMENT") DB_URI = process.env.DB_LOCAL_URI;
    if (process.env.NODE_ENV === "PRODUCTION") DB_URI = process.env.DB_URI;

    if (!DB_URI) {
        console.error("MongoDB URI is not defined. Check your environment variables!");
        process.exit(1); // exit the process to prevent further errors
    }

    mongoose.connect(DB_URI)
        .then((con) => {
            console.log(`MongoDB connected: ${con.connection.host}`);
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
        });
};
