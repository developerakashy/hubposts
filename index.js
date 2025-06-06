'use strict';

require("dotenv").config();
const connectDB = require("./db/config.js");
const app = require("./server");
const port = process.env.BACKEND_PORT || 8080;

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    });
})
.catch((err) => {
    console.log('Error connecting DB: ', err)
})
