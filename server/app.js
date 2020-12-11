const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const dBModule = require("./dbModule.js");
const Link = require("./models/link.js");
const AbortController = require("abort-controller");

//Setting config varibles
let startUrl = "https://en.wikipedia.org/wiki/Linus";
let linksToCreate;
setConfigVaribles();

//Connect to MongoDB
connectToMongo("WebCrawler");

console.log("Starting at " + startUrl);

setTimeout(() => {
  main();
}, 1);

//Main function, needed async
async function main() {
  let deadEnd = false;
  while (
    (!(await dBModule.findInDB(Link).length) ||
      (await dBModule.findInDB(Link).length) < linksToCreate) &&
    !deadEnd
  ) {
    if (!(await dBModule.findInDBOne(Link))) {
      await addLinksFromURL(startUrl);
    } else {
      let tmp = await dBModule.getUnvisited(Link);
      await addLinksFromURL(tmp.link);
    }
    if (!(await dBModule.getUnvisited(Link))) {
      deadEnd = true;
      console.log("Dead End!!!");
    }
  }
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

async function checkIfExist(theLink) {
  return await dBModule.searchInDBOne(Link, theLink);
}

async function addsOrUpdatesLink(url) {
  let checkExist = await checkIfExist(url);
  if (checkExist) {
    /*linksFile = JSON.parse(fs.readFileSync("./links.json"));
    let tmp = linksFile;
    for (let i = 0; i < tmp.links.length; i++) {  HITS HERERHEIOREHEKRNFHSDAJKFHUDSHFKJFDSHJKFHKJF
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
    linksFile = JSON.parse(fs.readFileSync("./links.json"));*/
  }
  if (!checkExist) {
    createLink(url);
  } else if (checkExist.visited == false) {
    dBModule.visit(Link, checkExist.link);
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
        let temp = await checkIfExist(links[i].href);
        if (!temp) {
          console.log(
            "\x1b[33m%s\x1b[0m",
            `[No of Links: ${await dBModule.getLength(Link)}]`,
            `- Latest link: ${links[i].href}`
          );
          createLink(links[i].href);
        }
      }
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

async function createLink(link) {
  let temp = await checkIfExist(link);
  if(!temp) {
    dBModule.saveToDB(
      new Link({
        link: link,
      })
    );
  }
  
}

async function setConfigVaribles() {
  let startLength = await dBModule.getLength(Link);
  linksToCreate = startLength + 200;

  if (process.argv[2]) {
    linksToCreate = startLength + process.argv[2];
    console.log("Creating " + process.argv[2] + " new links!");
    console.log("That will make the total " + linksToCreate);
  }

  if (process.argv[3]) {
    startUrl = process.argv[3];
  }
}
