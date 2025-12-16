const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup
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

// Endpoint for registration
app.post("/register", upload.none(), (req, res) => {
  const { fullname, phone, email, photo } = req.body;

  // Save base64 photo to file if exists
  let photoFilename = null;
  if (photo) {
    const base64Data = photo.replace(/^data:image\/png;base64,/, "");
    photoFilename = `${Date.now()}.png`;
    require("fs").writeFileSync(path.join(__dirname, "uploads", photoFilename), base64Data, "base64");
  }

  console.log("New registration:", { fullname, phone, email, photoFilename });

  res.json({ success: true, message: "Registration successful!", data: { fullname, phone, email, photoFilename } });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
