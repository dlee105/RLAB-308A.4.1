import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

const favList = document.getElementById("favList");

const favData = [];
// window.addEventListener("click", (e) => {
//   if (
//     e.target.tagName == "path" &&
//     e.target.parentNode.parentNode.classList.contains("favourite-button")
//   ) {
//     console.log(true);
//     let id = e.target.parentNode.parentNode.previousElementSibling.id;
//   }
// });
// Step 0: Store your API key here for reference and easy access.

const API_KEY =
  "live_sSQAsxkEnNsE8q4cyi5RH0g46fPSEP2bT3UCyJQWbZTIPsKp8T4fospzs4bKI4dO";

const endpoint = "https://api.thecatapi.com/v1/";

const headers = new Headers({
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
});

axios.defaults.headers.common = { "x-api-key": API_KEY };

var requestOptions = {
  method: "GET",
  headers: headers,
  redirect: "follow",
};

let config = {
  headers: { "Content-Type": "application/json" },
  onDownloadProgress: (progressEvent) => {
    const bodyEl = document.querySelector("body");
    bodyEl.style.cursor = "wait";

    const percentage = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    progressBar.style.width = `${percentage}%`;
    console.log(percentage);
    if (percentage === 100) {
      console.log("DONE");
    }
    setTimeout(() => (bodyEl.style.cursor = "auto"), 1200);
  },
};

// CALCULATING API RUNTIME WITH INTERCEPTORS
axios.interceptors.request.use(
  function (config) {
    console.time(config.url);
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.timeEnd(response.config.url);
    return response;
  },
  (error) => {
    console.timeEnd(error.response.config.url);
    return Promise.reject(error);
  }
);

async function initialLoad2() {
  console.log("Loading...");
  await axios
    .get(endpoint + "breeds", config)
    .then((response) => {
      console.log(response.data);
      for (let obj of response.data) {
        if (!obj.image) break;
        const carouselItem = Carousel.createCarouselItem(
          obj.image.url,
          obj.name,
          obj.image.id
        );
        Carousel.appendCarousel(carouselItem);
        const breedName = document.createElement("option");
        breedName.setAttribute("id", obj.id);
        breedName.innerText = obj.name;
        breedSelect.appendChild(breedName);
      }
      Carousel.start();
    })
    .catch((error) => console.log);
}

async function getSelectedInfo(query) {
  progressBar.style.width = "0";
  infoDump.innerHTML = "";

  const { data } = await axios.get(
    endpoint + `breeds/search?q=${query}`,
    config
  );

  let parsedData = {
    id: data[0].id,
    name: data[0].name,
    weight: `${data[0].weight.imperial} pounds`,
    height: `${data[0].weight.metric} inches`,
    life_span: `${data[0].life_span} years`,
    image: data[0].image,
  };
  let firstBreed = parsedData;
  console.log(parsedData);
  infoDump.innerHTML = `
  <div class="d-flex">
    <img src=${parsedData.image.url} alt="" width="250px" height="250px" id=${parsedData.image.id}/>
    <div class="px-5 d-flex flex-column">
      <h1>Selected Cat: ${parsedData.name}</h1>
      <p>ID: ${parsedData.id}</p>
      <p>Weight: ${parsedData.weight}</p>
      <p>Height: ${parsedData.height}</p>
      <p>Life Span: ${parsedData.life_span}</p> 
    </div>
  </div>`;
}

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */
const deleteFav = async (id) => {
  for (let obj of favData) {
    if (obj.id == id) {
      console.log(true);
      break;
    }
  }
  await axios.delete("https://api.thecatapi.com/v1/favourites/" + id, config);
};

const checkFav = async () => {
  const { data } = await axios.get(
    `https://api.thecatapi.com/v1/favourites?limit=20&sub_id=duyle`,
    config
  );

  const temp = document.createElement("div");
  temp.classList.add("d-flex", "flex-wrap");

  data.map((obj) => {
    const listItem = document.createElement("div");
    listItem.style.position = "relative";
    listItem.innerHTML = `<img src=${obj.image.url} alt="" width="150px" height="150px"/>
    <button style="position: absolute; top: 0; left: 0;" id="${obj.id}">Remove</button>
    `;
    temp.appendChild(listItem);
    favData.push(obj);
  });
  favList.appendChild(temp);
  console.log(favData);
};

const load = () => {
  initialLoad2();
  checkFav();
};

breedSelect.addEventListener("onLoad", load());

breedSelect.addEventListener("change", (e) => {
  e.preventDefault();
  getSelectedInfo(e.target.value);
});

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
  console.log(imgId);

  await axios
    .post(
      `https://api.thecatapi.com/v1/favourites/`,
      {
        image_id: imgId,
        sub_id: "duyle",
      },
      config
    )
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

  // your code here
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

getFavouritesBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  Carousel.clear();

  let { data } = await axios.get(
    "https://api.thecatapi.com/v1/favourites?sub_id=duyle",
    config
  );

  console.log(data);
  data.map((obj) => {
    Carousel.appendCarousel(
      Carousel.createCarouselItem(obj.image.url, obj.image_id, obj.image_id)
    );
  });
});

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
