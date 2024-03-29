const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");

app.use(express.json({ extended: false }));
app.use(cors());
app.use("/api", require("./routes/api/news"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
