const BASE_URL = "http://localhost:3000";
// BASE_URL = "https://extension-wellfound-backend.vercel.app";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const REFINE_TYPES = [
  "grammar",
  "conciseness",
  "length",
  "clarity",
  "completeness",
  "formality",
];

const REFINE_TYPE_TO_LABEL = {
  grammar: "Improve Grammar",
  conciseness: "Improve Conciseness",
  length: "Increase Length",
  clarity: "Improve Clarity",
  completeness: "Improve Completeness",
  formality: "Improve Formality",
};

let inputFields = [];

function waitForApplyButton() {
  const intervalId = setInterval(() => {
    const applyButton = document.querySelector(
      'button[data-test="JobDescriptionSlideIn--SubmitButton"], button[data-test="JobApplicationModal--SubmitButton"]'
    );

    if (applyButton) {
      if (document.getElementById("writeWithAIButton")) {
        return;
      }

      // Create the "Write with AI" button
      const writeWithAIButton = document.createElement("button");
      writeWithAIButton.id = "writeWithAIButton";
      writeWithAIButton.textContent = "Write with AI";
      writeWithAIButton.type = "button";
      writeWithAIButton.className = applyButton.className;

      applyButton.insertAdjacentElement("afterend", writeWithAIButton);

      applyButton.addEventListener("click", () => {
        writeWithAIButton.disabled = true;
      });

      writeWithAIButton.addEventListener("click", async () => {
        try {
          writeWithAIButton.disabled = true;
          writeWithAIButton.textContent = "Loading...";
          const aboutTheJob =
            document.querySelector('div[data-test="JobDetail"]')?.children[0]
              ?.textContent ||
            document.querySelector("#job-description")?.textContent;

          sanitisePage();


          // Select all job-related inputs
          inputFields = Array.from(
            document.querySelectorAll("[id^='form-input--']")
          );
          inputFields = inputFields.filter(
            (input) =>
              !["radio", "checkbox", undefined, "submit", "button"].includes(
                input.type
              )
          );

          if (inputFields.length === 0) {
            alert("No job-related input fields found.");
            return;
          }

          let questions = [];
          let inputsMap = new Map();

          inputFields.forEach((input) => {
            const questionText =
              input.parentElement?.previousElementSibling?.textContent?.trim();
            if (questionText) {
              questions.push(questionText);
              inputsMap.set(questionText, input);
            }
          });

          chrome.storage.local.get(["resumeText"], async (result) => {
            let resume = result.resumeText || "";

            const bodyForApi = JSON.stringify({
              aboutTheJob: aboutTheJob + "\n Here is my resume: " + resume,
              question: questions,
            });

            try {
              const response = await fetch(`${BASE_URL}/api/write`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer 159",
                },
                body: bodyForApi,
              });

              if (!response.ok) throw new Error("Failed to fetch data");

              let data = await response.json();
              //   console.log("Response from AI: ", data);
              data = data.response.split("%%");
              //   console.log("After spliting: ", data);

              // Populate fields with responses
              questions.forEach((question, index) => {
                const inputField = inputsMap.get(question);
                if (inputField && data[index]) {
                  inputField.value = data[index];
                  inputField._valueTracker?.setValue("");
                  inputField.dispatchEvent(
                    new Event("input", { bubbles: true })
                  );
                  inputField.setAttribute("rows", "10");

                  if (data[index].includes("[") || data[index].includes("]")) {
                    const warningMessage = document.createElement("div");
                    warningMessage.id = "warningMessage" + index;
                    warningMessage.textContent =
                      "Please fill up the missing info in brackets [ ] above.";
                    warningMessage.style.color = "red";
                    warningMessage.style.marginTop = "5px";
                    warningMessage.style.fontSize = "10px";
                    inputField.insertAdjacentElement(
                      "afterend",
                      warningMessage
                    );
                  }

                  inputField.insertAdjacentElement(
                    "afterend",
                    generateRefineContentButton(applyButton, index)
                  );
                }
              });

              await sleep(1000);
            } catch (error) {
              console.error("Error during API call:", error);
              alert("Failed to fetch data.");
            } finally {
              writeWithAIButton.disabled = false;
              writeWithAIButton.textContent = "Write with AI";
            }
          });
        } catch (error) {
          console.error("Error:", error);
          alert("Failed to process inputs.");
          writeWithAIButton.disabled = false;
          writeWithAIButton.textContent = "Write with AI";
        }
      });

      console.log("Apply button and AI button initialized.");
    }
  }, 100);
}

// Start script execution
waitForApplyButton();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  let resume = message.resume;
  console.log(resume);
  localStorage.setItem("resume", resume);
});

function generateRefineContentButton(applyButton, index) {
  const button = document.createElement("button");
  button.id = "reviseContentButton" + index;
  button.textContent = "Revise Content";
  button.type = "button";
  button.className = applyButton.className;
  button.style.padding = "1px 16px";

  button.addEventListener("click", () => {
    // Open a dialog box with all the refine options
    const dialog = document.createElement("dialog");
    dialog.id = "refineOptionsForm" + index;
    dialog.style.border = "none";
    dialog.style.borderRadius = "8px";
    dialog.style.padding = "20px";
    dialog.style.backgroundColor = "#f9f9f9";
    dialog.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    const form = document.createElement("form");
    form.method = "dialog";
    form.id = "refineOptionsForm" + index;
    form.onsubmit = () => refineContent(index);
    const h2 = document.createElement("h2");
    h2.textContent = "Refine Options";
    h2.style.marginBottom = "15px";
    h2.style.fontSize = "1.5em";
    h2.style.color = "#333";
    form.appendChild(h2);

    REFINE_TYPES.forEach((type) => {
      const label = document.createElement("label");
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.gap = "10px";
      label.style.fontSize = "1em";
      label.style.color = "#555";
      label.textContent = REFINE_TYPE_TO_LABEL[type];
      const input = document.createElement("input");
      input.style.marginRight = "5px";
      input.type = "radio";
      input.name = "refineType";
      input.value = type;
      label.appendChild(input);
      form.appendChild(label);
    });
    const cancelButton = document.createElement("button");
    cancelButton.style.marginRight = "10px";
    cancelButton.style.backgroundColor = "#0056b3";
    cancelButton.style.color = "white";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "5px";
    cancelButton.style.cursor = "pointer";
    cancelButton.textContent = "Cancel";
    cancelButton.type = "button";
    cancelButton.onclick = () => dialog.close();
    form.appendChild(cancelButton);
    const refineButton = document.createElement("button");
    refineButton.textContent = "Refine it!";
    refineButton.type = "submit";
    refineButton.style.backgroundColor = "#007bff";
    refineButton.style.color = "white";
    refineButton.style.border = "none";
    refineButton.style.borderRadius = "5px";
    refineButton.style.cursor = "pointer";
    form.appendChild(refineButton);
    dialog.appendChild(form);
    document.body.insertAdjacentElement("afterend", dialog);
    dialog.showModal();
  });

  return button;
}

async function refineContent(index) {
  const dialog = document.getElementById("refineOptionsForm" + index);
  dialog.close();

  const refineType = document.querySelector(
    'input[name="refineType"]:checked'
  ).value;
  console.log(refineType);

  const bodyForApi = JSON.stringify({
    text: inputFields[index].value,
    refineType: refineType,
  });

  const response = await fetch(`${BASE_URL}/api/refine`, {
    method: "POST",
    body: bodyForApi,
  });

  const responseData = await response.json();
  console.log(responseData);

  inputFields[index].value = responseData.refinedText;
  inputFields[index]._valueTracker?.setValue("");
  inputFields[index].dispatchEvent(new Event("input", { bubbles: true }));
}

function sanitisePage() {
  // remove all the reviseContentButton from the page
  const reviseContentButtons = document.querySelectorAll(
    "button[id^='reviseContentButton']"
  );
  reviseContentButtons.forEach((button) => button.remove());

  // remove all the refineOptionsForm from the page
  const refineOptionsForms = document.querySelectorAll(
    "form[id^='refineOptionsForm']"
  );
  refineOptionsForms.forEach((form) => form.remove());

  // remove all warning messages from the page
  const warningMessages = document.querySelectorAll(
    "div[id^='warningMessage']"
  );
  warningMessages.forEach((message) => message.remove());
}
