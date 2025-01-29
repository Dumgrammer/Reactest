const express = require('express')
const app = express()
require('dotenv').config();
const port = process.env.PORT


app.listen(port || 8080, () => {
    console.log(`Example app listening on port ${port}!`)
});