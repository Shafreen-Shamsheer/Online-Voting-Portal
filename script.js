document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId");
    const userType = localStorage.getItem("userType");

    if (!userId) {
        alert("User ID not found. Please log in again.");
        window.location.href = "index2.html"; // Redirect if not logged in
        return;
    }
    // Add event listener for logout button
    document.getElementById("logoutBtn").addEventListener("click", function () {
        alert("Logged out successfully!");
        window.location.href = "index2.html"; // Redirects to login page
    });

    if (userType === "participant") {
        document.getElementById("participants-section").style.display = "block";
        document.getElementById("voters-section").style.display = "none";
    } else {
        document.getElementById("participants-section").style.display = "none";
        document.getElementById("voters-section").style.display = "block";
    }
    loadParticipants();
});

let participants = JSON.parse(localStorage.getItem("participants")) || [];

// Register a new participant
function registerParticipant() {
    const participantName = document.getElementById("participant-name").value;

    if (!participantName) {
        alert("Please enter a name.");
        return;
    }
    // Add event listener for logout button
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.clear(); // ✅ Clears all stored user data
        alert("Logged out successfully!");
        window.location.href = "index2.html"; // Redirects to login page
    });
    const newParticipant = { id: participants.length + 1, name: participantName, votes: 0 };
    participants.push(newParticipant);
    localStorage.setItem("participants", JSON.stringify(participants));

    alert("Participant registered successfully!");
    loadParticipants();
}

// Delete a participant
function deleteParticipant(participantId) {
    participants = participants.filter(p => p.id !== participantId);
    localStorage.setItem("participants", JSON.stringify(participants));

    alert("Participant deleted successfully!");
    loadParticipants();
}

// Load all participants (only registered ones appear in voter section)
function loadParticipants() {
    const participantSection = document.getElementById("participants-list");
    participantSection.innerHTML = "";

    if (participants.length === 0) {
        participantSection.innerHTML = "<p>No participants registered yet.</p>";
    } else {
        participants.forEach(participant => {
            const div = document.createElement("div");
            div.classList.add("participant");
            div.innerHTML = `
                <p>${participant.name} - Votes: <span id="vote-count-${participant.id}">${participant.votes}</span></p>
                <button onclick="castVote(${participant.id})">Vote</button>
                <button class="delete-btn" onclick="deleteParticipant(${participant.id})">Delete</button>
            `;
            participantSection.appendChild(div);
        });
    }
}

// Cast a vote
function castVote(participantId) {
    const userId = localStorage.getItem("userId");
    const userType = localStorage.getItem("userType");

    if (!userId || userType !== "voter") {
        alert("Only voters can cast votes.");
        return;
    }

    let participant = participants.find(p => p.id === participantId);
    if (participant) {
        participant.votes += 1;
        localStorage.setItem("participants", JSON.stringify(participants));
        document.getElementById(`vote-count-${participant.id}`).innerText = participant.votes;
        alert("Vote cast successfully!");
    }
}
