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
  "custom",
];

const REFINE_TYPE_TO_LABEL = {
  grammar: "Improve Grammar",
  conciseness: "Improve Conciseness",
  length: "Increase Length",
  clarity: "Improve Clarity",
  completeness: "Improve Completeness",
  formality: "Improve Formality",
  custom: "Custom Prompt",
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

  button.addEventListener("click", () => {
    // Open a dialog box with all the refine options
    const dialog = document.createElement("dialog");
    dialog.id = "refineOptionsForm" + index;
    dialog.style.border = "1px solid #e0e0e0";
    dialog.style.borderRadius = "12px";
    dialog.style.padding = "24px";
    dialog.style.backgroundColor = "#ffffff";
    dialog.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
    dialog.style.maxWidth = "400px";
    dialog.style.width = "90%";
    dialog.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    
    const form = document.createElement("form");
    form.method = "dialog";
    form.id = "refineOptionsForm" + index;
    form.onsubmit = () => refineContent(index);
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.gap = "16px";
    
    const h2 = document.createElement("h2");
    h2.textContent = "Refine Your Answer";
    h2.style.margin = "0 0 8px 0";
    h2.style.fontSize = "1.5rem";
    h2.style.fontWeight = "600";
    h2.style.color = "#333333";
    h2.style.textAlign = "center";
    form.appendChild(h2);
    
    const subtitle = document.createElement("p");
    subtitle.textContent = "Choose how you want to improve your answer:";
    subtitle.style.margin = "0 0 8px 0";
    subtitle.style.fontSize = "0.9rem";
    subtitle.style.color = "#666666";
    subtitle.style.textAlign = "center";
    form.appendChild(subtitle);
    
    const optionsContainer = document.createElement("div");
    optionsContainer.style.display = "flex";
    optionsContainer.style.flexDirection = "column";
    optionsContainer.style.gap = "10px";
    optionsContainer.style.marginTop = "8px";
    optionsContainer.style.marginBottom = "16px";

    REFINE_TYPES.forEach((type) => {
      const label = document.createElement("label");
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.padding = "10px 12px";
      label.style.borderRadius = "8px";
      label.style.cursor = "pointer";
      label.style.transition = "background-color 0.2s";
      label.style.backgroundColor = "#f5f5f5";
      label.style.border = "1px solid #e0e0e0";
      
      label.addEventListener("mouseover", () => {
        label.style.backgroundColor = "#edf5ff";
      });
      
      label.addEventListener("mouseout", () => {
        label.style.backgroundColor = "#f5f5f5";
      });
      
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "refineType";
      input.value = type;
      input.style.marginRight = "12px";
      input.style.cursor = "pointer";
      input.style.accentColor = "#0073ea";
      
      const labelText = document.createElement("span");
      labelText.textContent = REFINE_TYPE_TO_LABEL[type];
      labelText.style.fontSize = "0.95rem";
      labelText.style.fontWeight = "500";
      labelText.style.color = "#444444";
      
      label.appendChild(input);
      label.appendChild(labelText);
      
      // Add PRO tag for custom prompt option
      if (type === "custom") {
        const proTag = document.createElement("span");
        proTag.textContent = "PRO";
        proTag.style.marginLeft = "auto";
        proTag.style.backgroundColor = "#FFD700";
        proTag.style.color = "#000";
        proTag.style.padding = "2px 6px";
        proTag.style.borderRadius = "4px";
        proTag.style.fontSize = "0.7rem";
        proTag.style.fontWeight = "bold";
        proTag.style.letterSpacing = "0.5px";
        label.appendChild(proTag);
        
        // Disable this option if not a pro user
        // You can implement a check for pro users here
        input.disabled = true;
        label.style.opacity = "0.7";
        label.title = "Upgrade to Pro to use custom prompts";
      }
      
      optionsContainer.appendChild(label);
    });
     
    form.appendChild(optionsContainer);
    
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.gap = "12px";
    buttonContainer.style.marginTop = "8px";
    
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.type = "button";
    cancelButton.style.padding = "10px 16px";
    cancelButton.style.backgroundColor = "#ffffff";
    cancelButton.style.color = "#0073ea";
    cancelButton.style.border = "1px solid #0073ea";
    cancelButton.style.borderRadius = "6px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.fontWeight = "500";
    cancelButton.style.fontSize = "0.9rem";
    cancelButton.style.transition = "background-color 0.2s";
    
    cancelButton.addEventListener("mouseover", () => {
      cancelButton.style.backgroundColor = "#f0f7ff";
    });
    
    cancelButton.addEventListener("mouseout", () => {
      cancelButton.style.backgroundColor = "#ffffff";
    });
    
    cancelButton.onclick = () => dialog.close();
    
    const refineButton = document.createElement("button");
    refineButton.textContent = "Refine Answer";
    refineButton.type = "submit";
    refineButton.style.padding = "10px 16px";
    refineButton.style.backgroundColor = "#0073ea";
    refineButton.style.color = "white";
    refineButton.style.border = "none";
    refineButton.style.borderRadius = "6px";
    refineButton.style.cursor = "pointer";
    refineButton.style.fontWeight = "500";
    refineButton.style.fontSize = "0.9rem";
    refineButton.style.transition = "background-color 0.2s";
    
    refineButton.addEventListener("mouseover", () => {
      refineButton.style.backgroundColor = "#005bb7";
    });
    
    refineButton.addEventListener("mouseout", () => {
      refineButton.style.backgroundColor = "#0073ea";
    });
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(refineButton);
    form.appendChild(buttonContainer);
    
    dialog.appendChild(form);
    document.body.insertAdjacentElement("afterend", dialog);
    
    // Add backdrop styling
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    
    dialog.showModal();
    
    // Set first option as default selected
    if (optionsContainer.querySelector('input[type="radio"]')) {
      optionsContainer.querySelector('input[type="radio"]').checked = true;
    }
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
