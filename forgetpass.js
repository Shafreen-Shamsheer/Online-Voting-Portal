document.getElementById("resetBtn").addEventListener("click", async () => {
    const email = document.getElementById("user_email").value;
    if (!email) {
        alert("Please enter your email");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
    }
});