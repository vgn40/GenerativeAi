const HUGGINGFACE_TOKEN = "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";

const userGame = document.getElementById("game-selection")
const buttonClicked = document.getElementById("button")

const userIsStuck =document.getElementById("stuck-option")
const userStrugglesWithGame =document.getElementById("game-is-hard-option")
const userStrugglesWithMechanic =document.getElementById("mechanic-option")
const userElaboration = document.getElementById("problem-in-question")
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
    return generatedText
}


/* chatgpt til loader */
const loader = document.getElementById("loader");
function showLoader() {
    loader.style.display = "block";
}
function hideLoader() {
    loader.style.display = "none";
}
fetch("https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct\"")
    .then(response => {
        // Process response
        hideLoader(); // Hide loader when response is received
    })
    .catch(error => {
        // Handle errors
        hideLoader(); // Hide loader in case of errors
    });

/* Chatgpt slut */

buttonClicked.addEventListener("click", function () {
    showLoader();
    const userGameSelected = userGame.value
    const stuckTrue = userIsStuck.checked
    const gameIsHardTrue = userStrugglesWithGame.checked
    const mechanicStruggleTrue = userStrugglesWithMechanic.checked
    const situationElaboration = userElaboration.value
    const firstPromptToRemove = "I want you to act like a old scary fortune teller, and I want you to tell me a give me a fictive fortune reading and tell me about my future - please base your response based on the following real details about me - My name is ";
    const secondPromptToRemove = "my current relationships status is:";
    let thirdPromptToRemove = "my worst fear is";
    let letPrompt = "";
        if (stuckTrue) {
            letPrompt = "Single";
        } else if (gameIsHardTrue) {
            letPrompt = "In a relationship";
        } else if (mechanicStruggleTrue) {
            letPrompt = "Waiting for Tesla robots to become available to the public";
        }

    const fullPrompt = `${firstPromptToRemove} ${userGameSelected} ${secondPromptToRemove} ${letPrompt} ${thirdPromptToRemove} ${situationElaboration}.`
    getGeneratedText(fullPrompt)
        .then(generatedText => {
            const userReplyBox = document.getElementById("user-wrapper");
                while (userReplyBox.firstChild) {
                    userReplyBox.removeChild(userReplyBox.firstChild);
                }
            let displayText = generatedText.substring(generatedText.indexOf(".") + 1);
            const chatBesked = document.createElement("p");
            chatBesked.innerHTML = displayText.trim();
            userReplyBox.appendChild(chatBesked);
            userReplyBox.classList.remove("hidden");
            userReplyBox.style.animation = "slideInFromTop 0.5s ease-in-out";
            hideLoader();
        })


        .catch(e => {
            console.error("Error:", e);
        });
});
