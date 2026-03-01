const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));;

const DATA_FILE = path.join(__dirname, "data.json");

/* SAFE READ FUNCTION */
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
    }
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
  } catch (err) {
    console.error("Read error:", err);
    return { users: [] };
  }
}

/* SAFE WRITE FUNCTION */
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Write error:", err);
  }
}

/* ROOT */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* REGISTER */
app.post("/register", (req, res) => {
  try {
    const { email, password } = req.body;
    const data = readData();

    if (data.users.find(u => u.email === email)) {
      return res.json({ success: false, message: "User exists" });
    }

    data.users.push({
      email,
      password,
      entries: [],
      journals: []
    });

    writeData(data);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

/* LOGIN */
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const data = readData();

    const user = data.users.find(
      u => u.email === email && u.password === password
    );

    if (!user) return res.json({ success: false });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

/* SAVE ENTRY */
app.post("/saveEntry", (req, res) => {
  try {
    const { email, mood, sleep, stress } = req.body;
    const data = readData();

    const user = data.users.find(u => u.email === email);
    if (!user) return res.json({ success: false });

    user.entries.push({
      mood,
      sleep,
      stress,
      date: new Date().toISOString()
    });

    writeData(data);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

/* GET ENTRIES */
app.get("/getEntries/:email", (req, res) => {
  try {
    const data = readData();
    const user = data.users.find(u => u.email === req.params.email);
    if (!user) return res.json([]);
    res.json(user.entries);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

/* SAVE JOURNAL */
app.post("/saveJournal", (req, res) => {
  try {
    const { email, text } = req.body;
    const data = readData();

    const user = data.users.find(u => u.email === email);
    if (!user) return res.json({ success: false });

    user.journals.push({
      text,
      date: new Date().toISOString()
    });

    writeData(data);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

/* GET JOURNALS */
app.get("/getJournals/:email", (req, res) => {
  try {
    const data = readData();
    const user = data.users.find(u => u.email === req.params.email);
    if (!user) return res.json([]);
    res.json(user.journals);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

