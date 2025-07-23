// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';
import { createServer } from 'http';
import SocketManager from "./socket/socket.manager.js";
import redisService from "./services/redis.service.js";

dotenv.config({
    path: './.env'
});

const httpServer = createServer(app);
const socketManager = new SocketManager(httpServer);

// Connect to MongoDB
connectDB()
    .then(() => {
        httpServer.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed !!! ", err);
    });

// Handle process events
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await cleanup();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await cleanup();
    process.exit(0);
});

// Cleanup function
async function cleanup() {
    try {
        // Close Redis connection
        await redisService.client.quit();
        console.log('Redis connection closed.');

        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');

        // Close HTTP server
        httpServer.close(() => {
            console.log('HTTP server closed.');
        });
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}










/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/