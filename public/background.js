chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.action === "ping") {
        console.log("Received ping request");
        sendResponse({ status: "ok" }); // Responding to the ping request
        return true;
    }

    if (message && typeof message === "object") {
        console.log("User data received:", message);

        // Save the data to storage
        chrome.storage.local.set({ userData: message }, () => {
            console.log("User data saved in extension storage.");
        });

        // Respond back
        sendResponse({ status: "success", message: "User data received by the extension" });
        return true;
    }

    sendResponse({ status: "error", message: "Invalid data format" });
});
