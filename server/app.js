const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const AbortController = require("abort-controller");
let deadEnd = false;

//if (!fs.existsSync("links.json"))
fs.writeFileSync("links.json", '{"links":[]}');
let linksFile = JSON.parse(fs.readFileSync("./links.json"));

//START URL
let startUrl = "https://inet.se/";

main();

//Main function, needed async
async function main() {
  while (linksFile.links.length < 100 && !deadEnd) {
    if (!linksFile.links[0]) {
      await addLinksFromURL(startUrl);
    } else {
      let tmp = 0;
      for (let i = 0; i < linksFile.links.length; i++) {
        if (!linksFile.links[i].visited) {
          await addLinksFromURL(linksFile.links[i].link);
        } else {
          tmp++;
        }
      }
      if (tmp == linksFile.links.length) deadEnd = true;
    }
  }
  if (deadEnd) console.log("DEADEND!!!");
}

//Fetches from link using node-fetch
async function fetchLink(url) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      reject();
    }, 1000);
    console.log(url);
    fetch(url, { signal: controller.signal })
      .then((res) => res.text())
      .then((body) => resolve(body))
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
          writeToJson({
            link: links[i].href,
            visited: false,
          });
        }
      }
      linksFile = JSON.parse(fs.readFileSync("./links.json"));
    }
  }
}
