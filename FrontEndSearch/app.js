const Link = require("../server/models/link.js");
const dBModule = require("../server/dbModule.js");
const fs = require("fs");
const express = require("express");
const app = express();
const port = 3000;

//Connect to MongoDB
connectToMongo("WebCrawler");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/search", async (req, res) => {
  console.log(req.query.search);
  let tmp = await dBModule.searchInDB(Link, req.query.search);

  console.log(tmp);
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
