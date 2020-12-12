const Link = require("../server/models/link.js");
const dBModule = require("../server/dbModule.js");
const fs = require("fs");
const express = require("express");
const app = express();
const port = 9588;

//Connect to MongoDB
connectToMongo("WebCrawler");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/js", (req, res) => {
    res.sendFile(__dirname + "/main.js");
  });

app.get("/search", async (req, res) => {
  let tmp = await dBModule.searchInDB(Link, req.query.search);
  res.json(tmp);
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));

function connectToMongo(dbName) {
  if (fs.existsSync("../server/mongoauth.json")) {
    dBModule.cnctDBAuth(dbName);
  } else {
    dBModule.cnctDB(dbName);
  }
}
