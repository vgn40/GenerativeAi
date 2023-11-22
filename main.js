const HUGGINGFACE_TOKEN = "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";

const userGame = document.getElementById("game-selection")
const buttonClicked = document.getElementById("button")

const userIsStuck =document.getElementById("stuck-option")
const userStrugglesWithGame =document.getElementById("game-is-hard-option")
const userStrugglesWithMechanic =document.getElementById("mechanic-option")
const userElaboration = document.getElementById("problem-in-question")
console.log("hello")

console.log("hello")

function fetchText(query) {
    return fetch(
        "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
        {
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: query }),
        }
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data && data[0] && data[0].generated_text) {
                return data[0].generated_text;
            } else {
                throw new Error('Generated text not found or structure is unexpected.');
            }
        })
        .catch((error) => {
            console.error('Error fetching text:', error);
            if (error.response) {
                console.error('Response from API:', error.response); // Log the API response details
            }
            throw error; // Rethrow the error to be handled in the calling function
        });
}

console.log("hello")

async function getGeneratedText(query) {
    // We can call this function 8 times before we respond
    let counter = 0;
    let prevGeneratedText = "";
    let generatedText = await fetchText(query);

    while (generatedText !== prevGeneratedText && counter < 8) {
        prevGeneratedText = generatedText;
        generatedText = await fetchText(generatedText);
        console.log(generatedText)
        counter++;
    }
    return generatedText;
}

buttonClicked.addEventListener("click", function () {
    console.log("clicked")

    const userGameSelected = userGame.value
    const stuckTrue = userIsStuck.value
    const gameIsHardTrue = userStrugglesWithGame.value
    const mechanicStruggleTrue = userStrugglesWithMechanic.value
    const situationElaboration = userElaboration.value

    const firstPromptToRemove = "I am currently playing ";
    const secondPromptToRemove = "im having the current issue that: ";
    const thirdPromptToRemove = "to be specific";
    let letPrompt = "";
    if (stuckTrue === "true") {
        letPrompt = "I am currently stuck";
    } else if (gameIsHardTrue === "true") {
        letPrompt = "The game is way too hard";
    } else if (mechanicStruggleTrue === "true") {
        letPrompt = "I am having difficulty with a certain mechanic";
    }

    const fullPrompt = `${firstPromptToRemove} ${userGameSelected} ${secondPromptToRemove} ${letPrompt} ${thirdPromptToRemove} ${situationElaboration}`
    getGeneratedText(fullPrompt)
        .then(generatedText => {
            const userReplyBox = document.getElementById("user-wrapper");
            // fik chatGPT til at hjælpe her
            // Clear the previous content inside userReplyBox
            while (userReplyBox.firstChild) {
                userReplyBox.removeChild(userReplyBox.firstChild);
            }
            let displayText = generatedText.replace(firstPromptToRemove, '');
            displayText = displayText.replace(userGameSelected, '');
            displayText = displayText.replace(secondPromptToRemove, '');
            displayText = displayText.replace(letPrompt, '');
            displayText = displayText.replace(thirdPromptToRemove, '');
            displayText = displayText.replace(situationElaboration, '');

            const chatBesked = document.createElement("p");
            chatBesked.textContent = displayText.trim(); // Trim any extra spaces
            userReplyBox.appendChild(chatBesked);
        })
        .catch(error => {
            // Handle errors if needed
            console.error("Error:", error);
        });
});


/// console.log(generatedText)
/// ${gameIsHardTrue}${mechanicStruggleTrue}${situationElaboration}${stuckTrue}
/// button.loading.classList.remove('hidden')