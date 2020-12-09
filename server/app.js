const { parse } = require("node-html-parser");
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//START URL
const startURL = "https://www.inet.se/";

main();

//Main function, needed async
async function main() {
  let dom = new JSDOM(await fetchLink(startURL));
  let links = dom.window.document.links
  console.log(links.length)
  for (let i = 0; i < links.length; i++) {
      if(links[i].href.startsWith("https")) console.log(links[i].href)
  }
}

//Fetches from link using node-fetch
async function fetchLink(link) {
  let tmp = await fetch(link);
  return await tmp.text();
}
