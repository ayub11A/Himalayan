const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
const PORT = 5000;

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use(session({
  secret: "adminsecret",
  resave: false,
  saveUninitialized: true
}));

// ===== Serve static files =====
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

// ===== Multer setup =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ".png");
  }
});
const upload = multer({ storage: storage });

// ===== MongoDB connection =====
mongoose.connect("mongodb://127.0.0.1:27017/university", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ===== User Schema =====
const userSchema = new mongoose.Schema({
  fullname: String,
  phone: String,
  email: String,
  course: String,
  department: String,
  nationality: String,
  photo: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

// ===== Admin login (demo) =====
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("123456", 10);

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login.html");
});

// ===== Register endpoint =====
app.post("/register", upload.none(), async (req, res) => {
  const { fullname, phone, email, course, department, nationality, photo } = req.body;

  let photoFilename = null;
  if (photo) {
    const base64Data = photo.replace(/^data:image\/png;base64,/, "");
    photoFilename = `${Date.now()}.png`;
    require("fs").writeFileSync(path.join(__dirname, "uploads", photoFilename), base64Data, "base64");
  }

  const user = new User({ fullname, phone, email, course, department, nationality, photo: photoFilename });
  await user.save();

  res.json({ success: true, message: "Registration successful!" });
});

// ===== Admin API to get all users =====
app.get("/admin/users", async (req, res) => {
  if (!req.session.admin) return res.status(401).json({ success: false, message: "Unauthorized" });
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
