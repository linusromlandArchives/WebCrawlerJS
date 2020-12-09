const fs = require("fs");
let linksFile = JSON.parse(fs.readFileSync("./links.json"));
let rand = Math.floor(Math.random()*linksFile.links.length)
console.log(linksFile.links[rand].link)