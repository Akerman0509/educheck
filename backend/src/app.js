const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load .env
dotenv.config();

// Import DB connector
const { connectDB } = require("./config/mongo.js");

// Import routes
const routes = require("./routes/index.route.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

// Connect to DB
connectDB().then(() => {
    // Start Indexer after DB connection
    const { startIndexer } = require("./services/indexer.service.js");
    startIndexer();
});

app.listen(3000, () => {
    console.log("Server running on 3000");
});
