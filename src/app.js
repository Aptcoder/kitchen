import dotenv from 'dotenv';
import express from 'express';
import loaders from './loaders/index.js';

dotenv.config();

const startServer = async () => {
    const app = express();
    
    // Body parsing middleware - must be before routes
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    const port = process.env.PORT || 3000;
    await loaders({ expressApp: app });
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();