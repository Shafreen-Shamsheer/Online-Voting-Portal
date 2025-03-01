document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("User ID not found. Please log in again.");
        window.location.href = "index2.html";
        return;
    }
    // Add event listener for logout button
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.clear(); // ✅ Clears all stored user data
    alert("Logged out successfully!");
    window.location.href = "index2.html"; // Redirects to login page
});
    loadParticipants();
});

// Fetch and display registered participants
async function loadParticipants() {
    try {
        const response = await fetch("http://localhost:5000/participants");
        const participants = await response.json();

        const participantsList = document.getElementById("participants-list");
        participantsList.innerHTML = "";

        if (participants.length === 0) {
            participantsList.innerHTML = "<p>No participants registered yet.</p>";
        } else {
            participants.forEach(participant => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <input type="radio" name="vote" value="${participant._id}"> ${participant.name}
                `;
                participantsList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Error loading participants:", error);
        alert("Failed to load participants.");
    }
}

// Submit Vote
document.getElementById("submitVote").addEventListener("click", async () => {
    const selected = document.querySelector("input[name='vote']:checked");
    if (!selected) {
        alert("Please select a participant to vote!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/vote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: localStorage.getItem("userId"), candidateId: selected.value })
        });

        const data = await response.json();
        if (response.ok) {
            showSuccessPopup("Vote cast successfully! ✅");
            loadParticipants(); // ✅ Refresh the list after voting
        } else {
            alert("Error: " + (data.error || "Failed to vote"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to vote. Please try again.");
    }
});

// Function to show success popup with tick symbol
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

