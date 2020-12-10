const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const AbortController = require("abort-controller");
const dBModule = require("./dbModule.js");
let deadEnd = false;

if (!fs.existsSync("links.json")) {
  fs.writeFileSync("links.json", '{"links":[]}');
}
let linksFile = JSON.parse(fs.readFileSync("./links.json"));

let startLength = linksFile.links.length;
let linksToCreate = startLength + 200;

if (process.argv[2]) {
  linksToCreate = startLength + process.argv[2];
  console.log("Creating " + process.argv[2] + " new links!");
}

//START URL
let startUrl = "https://en.wikipedia.org/wiki/Linus";

//Connect to MongoDB
connectToMongo("WebCrawler");

if (process.argv[3]) {
  startUrl = process.argv[3];
}

console.log("Starting at " + startUrl);

setTimeout(() => {
  main();
}, 3000);

//Main function, needed async
async function main() {
  while (linksFile.links.length < linksToCreate && !deadEnd) {
    if (!linksFile.links[0]) {
      await addLinksFromURL(startUrl);
    } else {
      let tmp = 0;
      for (let i = 0; i < linksFile.links.length; i++) {
        if (!linksFile.links[i].visited) {
          await addLinksFromURL(linksFile.links[i].link);
          break;
        } else {
          tmp++;
        }
        if (linksFile.links.length > linksToCreate) break;
      }
      if (tmp == linksFile.links.length) deadEnd = true;
      if (linksFile.links.length > linksToCreate) break;
    }
  }
  if (deadEnd) console.log("Dead End!!!");
}

//Fetches from link using node-fetch
async function fetchLink(url) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      reject();
    }, 1000);
    fetch(url, { signal: controller.signal })
      .then((res) => res.text())
      .then((body) => resolve(body))
      .catch(() => reject())
      .finally(() => {
        clearTimeout(timeout);
      });
  });
}

function writeToJson(obj) {
  let tmp = JSON.parse(fs.readFileSync("./links.json"));
  tmp.links.push(obj);
  fs.writeFileSync("links.json", JSON.stringify(tmp), "utf8");
}

function checkIfExist(link) {
  linksFile = JSON.parse(fs.readFileSync("./links.json"));
  let exists = false;

  for (let i = 0; i < linksFile.links.length; i++) {
    if (linksFile.links[i].link == link) {
      exists = linksFile.links[i];
      break;
    }
  }
  return exists;
}

function addsOrUpdatesLink(url) {
  let checkExist = checkIfExist(url);
  if (checkExist) {
    linksFile = JSON.parse(fs.readFileSync("./links.json"));
    let tmp = linksFile;
    for (let i = 0; i < tmp.links.length; i++) {
      if (tmp.links[i].link == url) {
        tmp.links[i].hits = tmp.links[i].hits + 1;

        if (tmp.links[i].hits == 3) {
          console.log(
            "New hit on: " +
              tmp.links[i].link +
              " with " +
              tmp.links[i].hits +
              " hits!"
          );
        }
      }
    }
    fs.writeFileSync("links.json", JSON.stringify(tmp), "utf8");
    linksFile = JSON.parse(fs.readFileSync("./links.json"));
  }
  if (!checkExist) {
    writeToJson({
      link: url,
      hits: 1,
      visited: true,
    });
  } else if (checkExist.visited == false) {
    let tmp = linksFile;
    for (let i = 0; i < tmp.links.length; i++) {
      if (tmp.links[i].link == url) {
        tmp.links[i].visited = true;
        break;
      }
    }
    fs.writeFileSync("links.json", JSON.stringify(tmp), "utf8");
    linksFile = JSON.parse(fs.readFileSync("./links.json"));
  }
}

async function addLinksFromURL(currentURL) {
  let dom;
  try {
    let htmlString = await fetchLink(currentURL);
    dom = new JSDOM(htmlString);
  } catch (error) {}
  if (dom) {
    let links = dom.window.document.links;
    addsOrUpdatesLink(currentURL);
    for (let i = 0; i < links.length; i++) {
      if (links[i].href.startsWith("https")) {
        if (!checkIfExist(links[i].href)) {
          console.log(
            "\x1b[33m%s\x1b[0m",
            `[No of Links: ${linksFile.links.length}]`,
            `- Latest link: ${links[i].href}`
          );
          writeToJson({
            link: links[i].href,
            hits: 1,
            visited: false,
          });
        }
      }
      linksFile = JSON.parse(fs.readFileSync("./links.json"));
    }
  }
}

function connectToMongo(dbName) {
  if (fs.existsSync("mongoauth.json")) {
    dBModule.cnctDBAuth(dbName);
  } else {
    dBModule.cnctDB(dbName);
  }
}