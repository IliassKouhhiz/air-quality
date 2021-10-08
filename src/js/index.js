require("../css/style.scss");
import FetchData from "./fetch-data";
import img_logo from "../img/air-quality-blue.svg";
import img_pin from "../img/pin-black.svg";
import img_search from "../img/search-without-border.svg";

let data;
let input = document.querySelector(".input");
let form_container = document.querySelector(".form-container");
let logo_container = document.querySelector(".logo-container");
let result_container = document.querySelector("#result-container");
let composition = document.querySelector("#composition");
let h1 = document.querySelector("#h1");
let h3 = document.querySelector("#h3");
let latitude;
let longitude;
let scale = document.querySelector(".scale-hidden");
let scale_unit = document.querySelectorAll(".scale-unit-hidden");

function preloader() {
  let preloader = document.getElementById("preloader");

  setTimeout(() => {
    preloader.remove();
  }, 2500);
}
preloader();

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      },
      (error) => {
        console.log(error.message);
        latitude = undefined;
        longitude = undefined;
        errorNotification("geo");
      }
    );
  }
}
geolocate();

class ImportImage {
  constructor(src, target, cls) {
    this.target = document.querySelector(target);
    this.img = document.createElement("img");
    this.img.src = src;
    this.img.classList.add(cls);

    this.child = function () {
      this.target.appendChild(this.img);
    };
    this.before = function () {
      this.target.before(this.img);
    };
    this.after = function () {
      this.target.after(this.img);
    };
  }
}

const logo = new ImportImage(img_logo, ".logo-container", "logo");
logo.child();
logo.img.addEventListener("click", () => {
  location.reload();
});

const search = new ImportImage(img_search, ".form", "search-icon");
search.before();

const pin = new ImportImage(img_pin, ".form", "pin-icon");
pin.after();

input.addEventListener("focus", () => {
  form_container.classList.add("focus");
});
input.addEventListener("blur", () => {
  form_container.classList.replace("focus", "blur");
});

function errorNotification(input) {
  let notification = document.createElement("div");
  let notification_msg = document.createElement("p");

  input === "city"
    ? (notification_msg.innerHTML = "<strong>Error:</strong>\nCity not found")
    : (notification_msg.innerHTML =
        "<strong>Geolocation Error:</strong>\nGeolocation needs to be enabled in order to use this feature. ");

  document.body.appendChild(notification);
  notification.appendChild(notification_msg);
  notification.classList.add("notification");

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

//Fetch data
document.querySelector(".form").addEventListener("submit", () => {
  if (input.value === "") {
    errorNotification("city");
  } else {
    const searchCity = new FetchData(input.value);
    async function getData() {
      data = await searchCity.city();
      if (typeof data !== "string") {
        updateData();
        showResults(data);
      } else {
        errorNotification("city");
      }
      console.log(data);
    }
    getData();
    input.value = "";
  }
});

pin.img.addEventListener("click", () => {
  const cityCoord = new FetchData(latitude + "; " + longitude);
  async function getData() {
    data = await cityCoord.geo();
    if (typeof data !== "string") {
      updateData();
      showResults(data);
    } else {
      errorNotification("geo");
    }
    console.log(data);
  }
  getData();
});

// Show results
function showResults(data) {
  logo_container.classList.add("logo-result");
  form_container.classList.add("form-result");
  //form_container.classList.remove("form-container");

  h1.innerHTML = data.city.name;
  h1.style.fontSize = "35px";
  h3.remove();

  scale.classList.add("scale-container");
  scale.classList.remove("scale-hidden");
  scale_unit.forEach((item) => {
    item.classList.add("scale-unit");
    item.classList.remove("scale-unit-hidden");
  });
  scaleColor();
  scaleValue();
  arrowPosition(data.aqi);
  quality(data.aqi);
  airComposition(data.iaqi, data.dominentpol);
  healthImplications(data.aqi);
}

function scaleColor() {
  let green = document.getElementById("green");
  let yellow = document.getElementById("yellow");
  let orange = document.getElementById("orange");
  let red = document.getElementById("red");
  let purple = document.getElementById("purple");
  let brown = document.getElementById("brown");

  green.style.cssText = `
    background-color: #009966;
    border-radius: 20px 0 0 20px;
  `;
  yellow.style.backgroundColor = "#ffde33";
  orange.style.backgroundColor = "#ff9933";
  red.style.backgroundColor = "#cc0033";
  purple.style.backgroundColor = "#660099";
  brown.style.cssText = `
    background-color: #7e0023;
    border-radius:  0 20px 20px 0;
  `;
}

function scaleValue() {
  let scale_value = document.querySelector(".scale-value");
  let scale_value_p = document.querySelectorAll(".scale-value > p");

  scale_value.removeAttribute("hidden");
  scale_value_p.forEach((item) => item.removeAttribute("hidden"));
}

function arrowPosition(value) {
  let w = scale.offsetWidth;
  let arrow = document.querySelector(".arrow-up");
  let x = (w - 6) / 6;

  function position() {
    if (value >= 0 && value <= 50) {
      return x / 2;
    } else if (value >= 51 && value <= 100) {
      return x + x / 2;
    } else if (value >= 101 && value <= 150) {
      return x * 2 + x / 2;
    } else if (value >= 151 && value <= 200) {
      return x * 3 + x / 2;
    } else if (value >= 201 && value <= 300) {
      return x * 4 + x / 2;
    } else {
      return x * 5 + x / 2;
    }
  }

  arrow.style.marginLeft = `${position() - 15}px`;
  arrow.removeAttribute("hidden");
}

function quality(value) {
  let aqi = document.getElementById("aqi");
  let quality = document.getElementById("quality");
  let result = document.querySelector("#result-container > div");
  aqi.innerHTML = value;

  if (value >= 0 && value <= 50) {
    quality.innerHTML = "Good";
  } else if (value >= 51 && value <= 100) {
    quality.innerHTML = "Moderate";
  } else if (value >= 101 && value <= 150) {
    quality.innerHTML = "Unhealthy for Sensitive Groups";
  } else if (value >= 151 && value <= 200) {
    quality.innerHTML = "Unhealthy";
  } else if (value >= 201 && value <= 300) {
    quality.innerHTML = "Very Unhealthy";
  } else {
    quality.innerHTML = "Hazardous";
  }

  result.style.backgroundColor = sectionColor(value);
  aqi.removeAttribute("hidden");
  quality.removeAttribute("hidden");
  result.classList.add("result");
  result_container.classList.add("result-container");
}

function sectionColor(value) {
  if (value >= 0 && value <= 50) {
    return "#009966";
  } else if (value >= 51 && value <= 100) {
    return "#ffde33";
  } else if (value >= 101 && value <= 150) {
    return "#ff9933";
  } else if (value >= 151 && value <= 200) {
    return "#cc0033";
  } else if (value >= 201 && value <= 300) {
    return "#660099";
  } else {
    return "#7e0023";
  }
}

function airComposition(obj, dom) {
  let h3 = document.querySelector("#composition > h3");
  composition.classList.add("composition");
  h3.removeAttribute("hidden");

  let remove = ["t", "h", "p", "w", "wg", "dew"];
  for (let i = 0; i < remove.length; i++) {
    delete obj[remove[i]];
  }
  console.log(obj);
  let key_arr = [];
  let value_arr = [];
  for (let key in obj) {
    key_arr.push(key);
    value_arr.push(obj[key].v);
  }

  key_arr.forEach((value, index) => {
    processData(key_arr, value_arr, index, dom);
  });
}

function processData(arr1, arr2, index, dom) {
  let container = document.getElementById("composition");
  let container_div = document.createElement("div");
  let key = document.createElement("p");
  let value = document.createElement("p");

  function unitOfMeasure(x) {
    if (x === "pm25" || x === "pm10") {
      return "µg/m3";
    } else {
      return "ppb";
    }
  }

  function dominant(x, target) {
    if (x === arr1[index]) {
      let dom = document.createElement("p");
      dom.innerHTML = "DOMINANT";
      dom.style.fontSize = "15px";
      target.appendChild(dom);
    }
  }

  key.innerHTML = arr1[index];
  value.innerHTML = arr2[index] + " " + unitOfMeasure(arr1[index]);
  container.appendChild(container_div);
  container_div.classList.add("composition-div");
  container_div.appendChild(key);
  dominant(dom, container_div);
  container_div.appendChild(value);
}

function updateData() {
  let obsolete = document.querySelectorAll(".composition-div");
  obsolete.forEach((value) => {
    value.remove();
  });
}

function healthImplications(value) {
  let health_container = document.querySelector("#health");
  let health_1 = document.querySelector("#health > p:first-of-type");
  let health_2 = document.querySelector("#health > p:last-of-type");

  if (value >= 0 && value <= 50) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Air quality is considered satisfactory, and air pollution poses little or no risk.";
    health_2.innerHTML = "";
  } else if (value >= 51 && value <= 100) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.";
    health_2.innerHTML =
      "Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.";
  } else if (value >= 101 && value <= 150) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
    health_2.innerHTML =
      "Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.";
  } else if (value >= 151 && value <= 200) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.";
    health_2.innerHTML =
      "Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else, especially children, should limit prolonged outdoor exertion.";
  } else if (value >= 201 && value <= 300) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Health warnings of emergency conditions. The entire population is more likely to be affected.";
    health_2.innerHTML =
      "Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else, especially children, should limit outdoor exertion.";
  } else {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Health alert! everyone may experience more serious health effects.";
    health_2.innerHTML = "Everyone should avoid all outdoor exertion.";
  }

  health_container.classList.add("health");
  if (health_2.innerHTML === "") {
    health_1.style.borderBottom = "none";
    health_1.style.paddingBottom = "0px";
    health_2.style.paddingTop = "0px";
  } else {
    health_1.style.borderBottom = "1px solid #c4ced3";
    health_1.style.paddingBottom = "20px";
    health_2.style.paddingTop = "20px";
  }
}

/*<div id="dom_5"></div>
  <div id="dom_4"></div>
  <div id="dom_2"></div>
  <div id="dom_1"></div>*/

/*function airComposition(obj, dom) {
  let h3 = document.querySelector("#composition > h3");

  composition.classList.add("composition");
  h3.removeAttribute("hidden");

  let key_arr = [];
  let value_arr = [];
  for (let key in obj) {
    key_arr.push(key);
    value_arr.push(obj[key].v);
  }
  console.log(key_arr);
  console.log(value_arr);
  processData(key_arr, value_arr, 5, dom);
  processData(key_arr, value_arr, 4, dom);
  processData(key_arr, value_arr, 2, dom);
  processData(key_arr, value_arr, 1, dom);
}

function processData(arr1, arr2, index, dom) {
  let key = document.createElement("p");
  let value = document.createElement("p");
  let container = document.getElementById(`dom_${index}`);

  function unitOfMeasure(x) {
    if (x === "pm25" || x === "pm10") {
      return "µg/m3";
    } else {
      return "ppb";
    }
  }

  function dominant(x, target) {
    if (x === arr1[index]) {
      let dom = document.createElement("p");
      dom.innerHTML = "Dominant";
      target.appendChild(dom);
    }
  }

  key.innerHTML = arr1[index];
  value.innerHTML = arr2[index] + " " + unitOfMeasure(arr1[index]);

  container.classList.add("composition-div");
  container.appendChild(key);
  dominant(dom, container);
  container.appendChild(value);
} */
