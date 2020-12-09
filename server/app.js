const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const AbortController = require('abort-controller');



if (!fs.existsSync("links.json"))
  fs.writeFileSync("links.json", '{"links":[]}');
let linksFile = JSON.parse(fs.readFileSync("./links.json"));

//START URL
let startUrl = "https://www.inet.se/";

main();

//Main function, needed async
async function main() {
  while (linksFile.links.length < 1000) {
    if (!linksFile.links[0]) {
      await addLinksFromURL(startUrl);
    } else {
      await linksFile.links.forEach(async (link) => {
        if (!link.visited) {
          await addLinksFromURL(link.link);
        }
      });
    }
  }
}

//Fetches from link using node-fetch
async function fetchLink(link) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => { controller.abort(); },
    500,
  );
   
  let tmp = await fetch(link, { signal: controller.signal });
  clearTimeout(timeout);
  console.log(tmp)
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

async function addLinksFromURL(currentURL) {
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
