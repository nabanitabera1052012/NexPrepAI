const mongoose = require("mongoose");

async function connectToDB() {
    try {
        console.log("MONGO_URL:", process.env.MONGO_URL); // 👈 ADD THIS

        await mongoose.connect(process.env.MONGO_URL);

        console.log("Connected to Database");
    } catch (error) {
        console.log("ERROR:", error.message);
    }
}

module.exports = connectToDB;