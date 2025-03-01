require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Verify required environment variables
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Error: Missing environment variables in .env file");
  process.exit(1);
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected to Atlas"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["voter", "admin"], default: "voter" },
  hasVoted: { type: Boolean, default: false }
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", UserSchema);

// Participant Schema
const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const Participant = mongoose.model("Participant", ParticipantSchema);

// Temporary storage for reset tokens
const resetTokens = new Map();

// Register Route
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully", token, role: user.role });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Forgot Password Route
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const token = crypto.randomBytes(20).toString("hex");
  resetTokens.set(token, { email, expires: Date.now() + 3600000 });

  const resetLink = `http://localhost:5000/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `Click the link below to reset your password:\n${resetLink}`,
  });

  res.json({ message: "Reset link sent to your email" });
});

// Reset Password Route
app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetData = resetTokens.get(token);
  if (!resetData || resetData.expires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const user = await User.findOne({ email: resetData.email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  resetTokens.delete(token);

  res.json({ message: "Password reset successful. You can now log in." });
});

// Register as a Participant
app.post("/register-participant", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Participant name is required" });
  }

  try {
    const participant = new Participant({ name });
    await participant.save();
    res.json({ message: "Successfully registered as a participant!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get All Registered Participants
app.get("/participants", async (req, res) => {
  try {
    const participants = await Participant.find();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Vote for a Participant
app.post("/vote", async (req, res) => {
  try {
      const { userId, candidateId } = req.body;

      console.log("Received vote request: ", req.body); // ✅ Debugging log

      // ✅ Check if IDs are missing
      if (!userId || !candidateId) {
          return res.status(400).json({ error: "User ID and Candidate ID are required." });
      }

      // ✅ Validate MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(candidateId)) {
          return res.status(400).json({ error: "Invalid userId or candidateId format." });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(400).json({ error: "User not found." });

      if (user.hasVoted) {
          return res.status(400).json({ error: "You have already voted!" });
      }

      const participant = await Participant.findById(candidateId);
      if (!participant) return res.status(400).json({ error: "Candidate not found." });

      participant.votes += 1;
      await participant.save();

      user.hasVoted = true;
      await user.save();

      res.json({ message: "Vote submitted successfully!" });
  } catch (error) {
      console.error("Voting Error:", error);
      res.status(500).json({ error: "Server error while voting." });
  }
});


// Get Voting Results
app.get("/results", async (req, res) => {
  try {
    const results = await Participant.find().select("name votes");
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
