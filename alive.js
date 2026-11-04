const express = require("express");
const app = express();

app.listen(3000, () => {
    console.log("LISTENING NOW");
});

setInterval(() => {
    console.log("alive");
}, 2000);