const express = require("express");
const bodyParser = require("body-parser");
const app = express();
let ejs = require("ejs");
const mongoose = require("mongoose");

let items = [];
let workItems = [];
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1/toDoListDB");

const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = new mongoose.model("Item", itemSchema);

let today = new Date();
let currentDay = today.getDay();
let domani = "";
let ieri = "";
currentDay === 6 ? (domani = 0) : (domani = currentDay + 1);
currentDay === 0 ? (ieri = 6) : (ieri = currentDay - 1);
function generateDay(d) {
  let day = "";
  switch (d) {
    case 0:
      day = "Sunday";
      break;
    case 1:
      day = "Monday";
      break;
    case 2:
      day = "Tuesday";
      break;
    case 3:
      day = "Wednesday";
      break;
    case 4:
      day = "Thursday";
      break;
    case 5:
      day = "Friday";
      break;
    case 6:
      day = "Saturday";
      break;
    default:
      console.log("not a valid day");
      break;
  }
  return day;
}
let tooday = generateDay(currentDay);

app.get("/", (req, res) => {
  res.render("index", {
    listType: "Default",
    EJS: tooday,
    newListItems: items,
  });
});
app.get("/work", (req, res) => {
  res.render("index", {
    listType: "Work",
    EJS: tooday,
    newListItems: workItems,
  });
});
app.get("/about", function (req, res) {
  res.render("about");
});
app.post("/", function (req, res) {
  const item = req.body.newItem;
  if (req.body.button === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);

    res.redirect("/");
  }
});

app.listen(3000, function () {
  console.log("server started on port 3000");
});
