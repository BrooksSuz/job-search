import Queue from "bull";
import dotenv from "dotenv";
import scrapeListings from "./scrape-listings/scrape-listings.js";
import logger from "./logger-backend.js";
import Redis from "ioredis";
import { Judoscale } from 'judoscale-bull';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const channelName = process.env.CHANNEL_NAME;
const pubClient = new Redis(redisUrl);
const judoscale = new Judoscale({
  redis_url: process.env.REDISCLOUD_URL,
})
const queueName =
  process.env.NODE_ENV === "production" ? "prodUserQueue" : "devUserQueue";
const userQueue = new Queue(queueName, redisUrl);

userQueue.process(1, async (job) => {
  const { keywords, objConfig } = job.data;
  const jobId = job.id;

  try {
    const listings = await scrapeListings(keywords, objConfig);
    return listings;
  } catch (err) {
    logger.error(`Error processing job ${jobId}:\n${err}`);
    pubClient.publish(
      channelName,
      JSON.stringify({ jobId, status: "failed", error: err.message }),
    );
    throw new Error("Job processing failed");
  }
});

userQueue.on("completed", async (job, result) => {
  const jobId = job.id;
  pubClient.publish(
    channelName,
    JSON.stringify({ jobId, status: "completed", result }),
  );
});

userQueue.on("failed", (job, err) => {
  const jobId = job.id;
  pubClient.publish(
    channelName,
    JSON.stringify({ jobId, status: "failed", error: err.message }),
  );
});
