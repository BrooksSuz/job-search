import dotenv from "dotenv";
import mongoose from "mongoose";
import Site from "./schemas/Site.js";
import User from "./schemas/User.js";
import logger from "./logger-backend.js";
dotenv.config();

const uri = process.env.MONGO_URI;
const db = process.env.DB;

async function connectToDb() {
  try {
    const options = {
      dbName: db,
    };

    await mongoose.connect(uri, options);
  } catch (err) {
    logger.error(`Error connecting to MongoDB: ${err}`);
  }
}

async function getPremadeConfigs() {
  const arrPremade = ["678e55b17462695271c1a2bb", "6757a5bfe3bdb76056b5bead"];
  try {
    const arrConfigs = await Site.find({ _id: { $in: arrPremade } }).sort({
      siteName: 1,
    });

    return arrConfigs;
  } catch (err) {
    logger.error(`Error in function getPremadeConfigs:\n${err}`);
  }
}

async function getSelectedConfigs(arrIds) {
  try {
    const arrConfigs = await Site.find({ _id: { $in: arrIds } });
    return arrConfigs;
  } catch (err) {
    logger.error(`Error in function getSelectedConfigs:\n${err}`);
  }
}

async function deleteUser(user) {
  const { _id, sites } = user;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await Site.deleteMany({
      _id: { $in: sites },
    }).session(session);

    const userResult = await User.findByIdAndDelete(_id).session(session);

    if (!userResult) throw new Error("User not found.");

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    logger.error(`Error in function deleteUser:\n${err}`);
  } finally {
    await session.endSession();
  }
}

// Connection events
mongoose.connection.on("error", (err) => {
  logger.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  logger.info("\nMongoose disconnected");
});

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    logger.info("\nMongoose disconnected through app termination");
    process.exit(0);
  } catch (err) {
    logger.error(`\nError closing MongoDB connection: ${err}`);
    process.exit(1);
  }
});

export {
  connectToDb,
  deleteUser,
  getPremadeConfigs,
  getSelectedConfigs,
  mongoose,
};
