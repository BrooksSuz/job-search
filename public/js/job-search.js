import { cleanUp, logMessage } from "../main.js";

let activeJobs = 0;

async function executeJobSearch(arrConfigs) {
  // Loop through each config
  for (const objConfig of arrConfigs) {
    const inputsAdvanced = document.querySelectorAll(
      ".advanced-container > label input",
    );

    // Encode user keywords
    const inputKeywords = document.querySelector(".keywords");
    const keywordsValue = inputKeywords.value.trim();

    // Organize keys (safety measure)
    const arrConfigKeys = Object.keys(objConfig);
    const arrOrganizedKeys = organizeKeys(inputsAdvanced, arrConfigKeys);

    // Fill search inputs
    populateInputs(inputsAdvanced, objConfig);

    // Create new config with organized inputs
    const newConfig = createNewConfig(arrOrganizedKeys, inputsAdvanced);

    // Feed the config to the API
    await consumeAPI(keywordsValue, newConfig);
  }
}

const organizeKeys = (inputsAdvanced, arrConfigKeys) => {
  const arrOrganizedKeys = [];
  inputsAdvanced.forEach((input) => {
    const id = input.id;
    const intIndexOfId = arrConfigKeys.indexOf(id);
    if (intIndexOfId !== -1) arrOrganizedKeys.push(arrConfigKeys[intIndexOfId]);
  });
  return arrOrganizedKeys;
};

const populateInputs = (inputsAdvanced, objConfig) => {
  inputsAdvanced.forEach((input) => {
    const id = input.id;
    if (id === "isAnchor") {
      input.checked = objConfig[id];
    } else if (id === "errorMessages") {
      input.value = objConfig[id].join(", ");
    } else {
      input.value = objConfig[id];
    }
  });
};

const createNewConfig = (arrConfigKeys, inputsAdvanced) => {
  const newConfig = {};
  inputsAdvanced.forEach((input, i) => {
    const key = arrConfigKeys[i];
    const value = arrConfigKeys[i] === "isAnchor" ? input.checked : input.value;

    newConfig[key] = value;
  });
  return newConfig;
};

const consumeAPI = async (inputKeywordsValue, objConfig) => {
  try {
    const response = await fetch("api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords: inputKeywordsValue,
        objConfig,
      }),
    });

    const { jobId } = await response.json();
    console.log(`Job ${jobId} received.`);
    activeJobs++;
  } catch (err) {
    await logMessage("error", err.message);
  }
};

const host = location.origin.replace(/^http/, "ws");
const ws = new WebSocket(host);

ws.addEventListener("open", () => {
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) ws.send("ping");
  }, 50000);
});

ws.addEventListener("message", async (e) => {
  if (typeof e.data === "string" && e.data === "pong") return;

  const data = JSON.parse(e.data);
  if (data.status === "failed") {
    await logMessage(
      "error",
      `Job ${data.jobId} failed with error: ${data.error}`,
    );
  } else if (data.status === "completed") {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(data.result, "text/html");

    let divListings = document.querySelector(".listings");
    if (!divListings) {
      const divMain = document.querySelector(".main-container");
      const footer = document.querySelector("footer");
      divListings = document.createElement("div");
      divListings.classList.add("listings", "flex");
      divMain.insertBefore(divListings, footer);
    }

    divListings.appendChild(htmlDoc.body.firstChild);
    activeJobs--;
    if (activeJobs === 0) {
      cleanUp();
      console.log("All done!");
    }
  }
});

export default executeJobSearch;
