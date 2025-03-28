const BASE_URL = "http://localhost:3000";
// BASE_URL = "https://extension-wellfound-backend.vercel.app";


function waitForApplyButton() {
    const intervalId = setInterval(() => {
        const applyButton = document.querySelector('button[data-test="JobDescriptionSlideIn--SubmitButton"], button[data-test="JobApplicationModal--SubmitButton"]');

        if (applyButton) {
            if (document.getElementById('writeWithAIButton')) {
                return;
            }

            // Create the "Write with AI" button
            const writeWithAIButton = document.createElement('button');
            writeWithAIButton.id = 'writeWithAIButton';
            writeWithAIButton.textContent = 'Write with AI';
            writeWithAIButton.type = 'button';
            writeWithAIButton.className = applyButton.className;

            applyButton.insertAdjacentElement('afterend', writeWithAIButton);

            applyButton.addEventListener("click", () => {
                writeWithAIButton.disabled = true;
            });

            writeWithAIButton.addEventListener("click", async () => {
                try {
                    const aboutTheJob = document.querySelector('div[data-test="JobDetail"]')?.children[0]?.textContent || 
                                        document.querySelector('#job-description')?.textContent;

                    // Select all job-related inputs
                    const inputFields = Array.from(document.querySelectorAll("[id^='form-input--']"));

                    if (inputFields.length === 0) {
                        alert("No job-related input fields found.");
                        return;
                    }

                    let questions = [];
                    let inputsMap = new Map();

                    inputFields.forEach(input => {
                        const questionText = input.parentElement?.previousElementSibling?.textContent?.trim();
                        if (questionText) {
                            questions.push(questionText);
                            inputsMap.set(questionText, input);
                        }
                    });

                    chrome.storage.local.get(["resumeText"], async (result) => {
                        let resume = result.resumeText || "";

                        const bodyForApi = JSON.stringify({
                            "aboutTheJob": aboutTheJob + "\n Here is my resume: " + resume,
                            "question": questions
                        });

                        try {
                            const response = await fetch(`${BASE_URL}/api/write`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": "Bearer 159"
                                },
                                body: bodyForApi
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
                                    inputField.dispatchEvent(new Event("input", { bubbles: true }));
                                    inputField.setAttribute("rows", "10");
                                }
                            });

                        } catch (error) {
                            console.error("Error during API call:", error);
                            alert("Failed to fetch data.");
                        }
                    });

                } catch (error) {
                    console.error("Error:", error);
                    alert("Failed to process inputs.");
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
