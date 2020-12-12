console.log("Hmm");

let out = document.getElementById("out");

let input = document.getElementById("search");

input.oninput = function () {
  if (input.value) {
    fetch("/search/?search=" + input.value)
      .then((response) => response.json())
      .then((value) => {
        //out.innerText = JSON.stringify(value);
        // expected output: "Success!"

        if (!(value == "[]")) {
          generateList(value);
        } else {
          out.innerHTML = "";
        }
      });
  } else {
    out.innerHTML = "";
  }
};

function generateList(json) {
  out.innerHTML = "";
  json.forEach((element) => {
    var result = document.createElement("A");
    if (element.link.length >= 50) {
      result.innerText = element.link.substring(0, 50) + "...";
    } else {
      result.innerText = element.link;
    }

    result.href = element.link;
    out.appendChild(result);
    out.appendChild(document.createElement("BR"));
    out.appendChild(document.createElement("BR"));
  });
}
