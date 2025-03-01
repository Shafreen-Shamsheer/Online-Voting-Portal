let signupBtn = document.getElementById("signupBtn");
let signinBtn = document.getElementById("signinBtn");
let nameField = document.getElementById("nameField");
let title = document.getElementById("title");
let ConfirmPassword = document.getElementById("ConfirmPassword");

signinBtn.onclick = function () {
    nameField.style.maxHeight = "0";
    ConfirmPassword.style.maxHeight = "0";
    title.innerHTML = "Sign In";
    signupBtn.classList.add("disable");
    signinBtn.classList.remove("disable");
};

signupBtn.onclick = function () {
    nameField.style.maxHeight = "60px";
    ConfirmPassword.style.maxHeight = "60px";
    title.innerHTML = "Sign Up";
    signupBtn.classList.remove("disable");
    signinBtn.classList.add("disable");
};

// Signup Request
async function registerUser() {
    const nameInput = document.querySelector("#nameField input");
    const confirmPasswordInput = document.querySelector("#ConfirmPassword input");

    if (!nameInput || !confirmPasswordInput) {
        console.error("Name or Confirm Password input not found!");
        return;
    }

    const name = nameInput.value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password_user").value;
    const confirmPassword = confirmPasswordInput.value;

    if (!email || !password) {
        alert("Please fill in all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Registration successful! Please log in.");
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


// Login Request
async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password_user").value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("userType", data.role); // Store role (voter or participant)
            alert("Login successful!");
            window.location.href = "dashboard.html"; // Redirect after login
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}



document.getElementById("signinBtn").addEventListener("click", loginUser);
// Attach event listeners to buttons
signupBtn.addEventListener("click", registerUser);
signinBtn.addEventListener("click", loginUser);
