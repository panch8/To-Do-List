const express = require("express");
const bodyParser = require("body-parser");
const app = express();
let ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1/toDoListDB");

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = new mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = new mongoose.model("List", listSchema);

// Default items.
const item1 = new Item({
  name: "Welcome to your to do list",
});

const item2 = new Item({
  name: "hit the + button to add items",
});

const item3 = new Item({
  name: "<---- check the item here to erase it.",
});
const defaultItems = [item1, item2, item3];

//root request
app.get("/", (req, res) => {
  Item.find({}, (err, itemsFound) => {
    if (err) console.log(err);
    else
      res.render("index", {
        listType: "Today",
        newListItems: itemsFound,
      });
  });
});
//custom routes requests from client with lodash always Cap and Deburr

app.get("/:categories", (req, res) => {
  const clientRoute = _.deburr(_.capitalize(req.params.categories));

  List.findOne({ name: clientRoute }, (err, docs) => {
    if (!err) {
      if (!docs) {
        //create a new list
        const newList = new List({ name: clientRoute, items: defaultItems });
        newList.save();
        res.redirect("/" + clientRoute);
      } else {
        //show existing list
        res.render("index", {
          listType: clientRoute,
          newListItems: docs.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listName = req.body.button;

  const itemClient = new Item({
    name: item,
  });
  if (listName === "Today") {
    itemClient.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, listFound) => {
      if (!err) {
        listFound.items.push(itemClient);
        listFound.save();
        res.redirect("/" + listName);
      }
    });
  }
});
app.post("/delete", function (req, res) {
  const itemTobeDeleted = req.body.checkbox;
  const listWhereToDelete = req.body.listName;

  if (listWhereToDelete === "Today") {
    Item.deleteOne({ name: itemTobeDeleted }, function (err) {
      if (err) console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listWhereToDelete },
      { $pull: { items: { name: itemTobeDeleted } } },
      (err, item) => {
        if (!err) {
          res.redirect("/" + listWhereToDelete);
        }
      }
    );
  }
});

app.listen(3000, function () {
  console.log("server started on port 3000");
});
