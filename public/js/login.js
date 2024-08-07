// Login handler
const logInHandler = async (event) => {
  event.preventDefault();

  // Query selection
  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPw").value.trim();

  // Fetch api
  if (email && password) {
    const response = await fetch("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (response.ok) {
      document.location.href = "/";
    } else {
      displayErrorMessage(data.message);
    }
  }
};

// Error handling
function displayErrorMessage(message) {
  const errorMessageEl = document.querySelector('#error-message');
  errorMessageEl.textContent = message;
};

// Event listener
document.querySelector("#loginForm").addEventListener("submit", logInHandler);
