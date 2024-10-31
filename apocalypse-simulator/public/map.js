// Function to change the text content of the element with id "hello-text"
function changeText() {
    const helloTextElement = document.getElementById('hello-text');
    if (helloTextElement) {
        helloTextElement.textContent = "Text changed by map.js!";
    }
}

// Call the function to change the text when the script loads
changeText();