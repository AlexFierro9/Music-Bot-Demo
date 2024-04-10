const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessageToChat(message, isUser = false) {
    const messageClass = isUser ? "user-message" : "bot-message";
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", messageClass);
    messageDiv.innerText = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


async function handleUserInput() {
    const userMessage = userInput.value;
    userInput.value = "";
    addMessageToChat(userMessage, true);

    // Call the Flask API for generating response
    const response = await fetch("http://127.0.0.1:5000/get_response", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ dialog: [userMessage] }),
    });

    if (response.ok) {
        const responseData = await response.json();
        const botResponse = responseData.generated_response;
        const emotion = responseData.emotion;
        const apiKey = responseData.api_key;

        addMessageToChat(botResponse);

        // Fetch music recommendations based on emotion
        const recommendationsUrl = `http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${emotion}&api_key=${apiKey}&format=json&limit=4`;
        const recommendationsResponse = await fetch(recommendationsUrl);

        if (recommendationsResponse.ok) {
            const recommendationsData = await recommendationsResponse.json();
            const recommendations = recommendationsData.tracks.track;
            displayRecommendations(recommendations);
        }
    }
}



function displayRecommendations(recommendations) {
    const recommendationsContainer = document.createElement("div");
    recommendationsContainer.classList.add("recommendations-container");

    recommendations.forEach((rec, index) => {
        const recommendationDiv = document.createElement("div");
        recommendationDiv.classList.add("recommendation");
        recommendationDiv.innerHTML = `
            <p class="track-name">${rec.name}</p>
            <p class="artist-name">by ${rec.artist.name}</p>
            <a class="listen-link" href="${rec.url}" target="_blank">Listen</a>
        `;
        recommendationsContainer.appendChild(recommendationDiv);
    });

    // Clear previous recommendations and append the new ones
    document.querySelector(".recommendations-container").innerHTML = "";
    document.querySelector(".input-container").appendChild(recommendationsContainer);
}


function displayRecommendations(recommendations) {
    const recommendationsContainer = document.createElement("div");
    recommendationsContainer.classList.add("recommendations-container");

    recommendations.forEach((rec, index) => {
        const recommendationDiv = document.createElement("div");
        recommendationDiv.classList.add("recommendation");
        recommendationDiv.innerHTML = `
            <p class="track-name">${rec.name}</p>
            <p class="artist-name">by ${rec.artist.name}</p>
            <a class="listen-link" href="${rec.url}" target="_blank">Listen</a>
        `;
        recommendationsContainer.appendChild(recommendationDiv);
    });

    // Clear previous recommendations and append the new ones
    const existingRecommendationsContainer = document.querySelector(".recommendations-container");
    if (existingRecommendationsContainer) {
        existingRecommendationsContainer.remove();
    }
    document.querySelector(".chat-container").appendChild(recommendationsContainer);
}







sendBtn.addEventListener("click", handleUserInput);
