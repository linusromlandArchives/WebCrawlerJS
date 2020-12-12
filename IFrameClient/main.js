let linksFile;
async function onLoad() {
  let promise = await fetch("./links.json");
  linksFile = JSON.parse(await promise.text());
  
  setInterval(changeLink, timePerSite);
}

let timePerSite = 2000

function changeLink() {
  console.log("change link here");
  let rand = Math.floor(Math.random() * linksFile.links.length);
  console.log(linksFile.links[rand].link);

  document.getElementById("frame").src = linksFile.links[rand].link
}
