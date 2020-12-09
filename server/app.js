const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const AbortController = require("abort-controller");
let deadEnd = false;

if (!fs.existsSync("links.json"))
  fs.writeFileSync("links.json", '{"links":[]}');
let linksFile = JSON.parse(fs.readFileSync("./links.json"));

//START URL
let startUrl = "https://marksism.space/";

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
          console.log(linksFile.links[i].link);
          await addLinksFromURL(linksFile.links[i].link);
        } else {
          tmp++;
        }
      }
      if (tmp == linksFile.links.length) deadEnd = true;
    }
  }
}

//Fetches from link using node-fetch
async function fetchLink(url) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 2000);
    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        let contentType = res.headers.get("content-type");
        if (contentType && !contentType.startsWith("text/html")){
          reject("");
        }else{
         res.text();          
        }
      })
      .then((body) => {
        resolve(body)
      })
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
  let exists = false;
  linksFile = JSON.parse(fs.readFileSync("./links.json"));
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
    let tmp = await fetchLink(currentURL)
    console.log(await tmp + " haha: " + currentURL)
    dom = new JSDOM(await tmp);
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
