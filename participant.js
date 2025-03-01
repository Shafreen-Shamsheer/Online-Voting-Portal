document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("User ID not found. Please log in again.");
        window.location.href = "index2.html";
        return;
    }
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("token"); // Remove authentication token
        alert("Logged out successfully!");
        window.location.href = "index2.html"; // Redirect to login page
      });
      
    document.getElementById("registerParticipant").addEventListener("click", registerParticipant);
    loadParticipants();
});

// Register a Participant with Popup Confirmation
async function registerParticipant() {
    const name = document.getElementById("participantName").value;
    if (!name) {
        alert("Enter your name to register!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/register-participant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        const data = await response.json();
        if (response.ok) {
            showSuccessPopup("Registration Successful! ✅");
            loadParticipants(); // Refresh participant list after registration
        } else {
            alert("Error: " + (data.error || "Failed to register participant"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to register participant. Please try again.");
    }
}

// Fetch and display registered participants
async function loadParticipants() {
    try {
        const response = await fetch("http://localhost:5000/participants");
        const participants = await response.json();

        const participantList = document.getElementById("participantsList");
        participantList.innerHTML = "";

        if (participants.length === 0) {
            participantList.innerHTML = "<p>No participants registered yet.</p>";
        } else {
            participants.forEach(participant => {
                const li = document.createElement("li");
                li.innerHTML = `${participant.name}`;
                participantList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Error loading participants:", error);
        alert("Failed to load participants.");
    }
}

// Function to Show Popup with Green Tick
function showSuccessPopup(message) {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `
        <div class="popup-content">
            <span class="tick-mark">✔</span>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove(); // Remove popup after 3 seconds
    }, 3000);
}
