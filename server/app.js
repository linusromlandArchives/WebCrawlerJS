const { parse } = require("node-html-parser");
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

if (!fs.existsSync("links.json"))
  fs.writeFileSync("links.json", '{"links":[]}');
let linksFile = JSON.parse(fs.readFileSync("./links.json"));

//START URL
let currentURL = "https://www.romland.space/";

main();

//Main function, needed async
async function main() {
  let dom = new JSDOM(await fetchLink(currentURL));
  let links = dom.window.document.links;

  addsOrUpdatesLink(currentURL);

  for (let i = 0; i < links.length; i++) {
    if (links[i].href.startsWith("https")) {
      if (!checkIfExist(links[i].href)) {
        writeToJson({
          link: links[i].href,
          visited: false,
        });
      }
    }
    linksFile = JSON.parse(fs.readFileSync("./links.json"));
  }
}

//Fetches from link using node-fetch
async function fetchLink(link) {
  let tmp = await fetch(link);
  return await tmp.text();
}

function writeToJson(obj) {
  let tmp = JSON.parse(fs.readFileSync("./links.json"));
  tmp.links.push(obj);
  fs.writeFileSync("links.json", JSON.stringify(tmp), "utf8");
}

function checkIfExist(link) {
  let exists = false;
  linksFile.links.forEach((theLink) => {
    if (theLink.link == link) {
      exists = theLink;
    }
  });
  return exists;
}

function addsOrUpdatesLink(url) {
  let checkExist = checkIfExist(url);
  if (!checkExist) {
    writeToJson({
      link: url,
      visited: true,
    });
  } else if (checkExist.visited == false) {
    let tmp = linksFile;
    for (let i = 0; i < tmp.links.length; i++) {
      if (tmp.links[i].link == url) tmp.links[i].visited = true;
    }
    fs.writeFileSync("links.json", JSON.stringify(tmp), "utf8");
    linksFile = JSON.parse(fs.readFileSync("./links.json"));
  }
}
