//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://sanket:sanket@cluster0.ws24uwx.mongodb.net/todolistDB');

const itemSchema = {
  name: String
};

const Item = mongoose.model('Item', itemSchema)

const item1 = new Item({
  name: 'Coding'
})

const item2 = new Item({
  name: 'Sleeping'
})

const item3 = new Item({
  name: 'Eating'
})

const defaultItems = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model('List', listSchema);


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully saved Default Items");
        }
      })
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  }
  )
});


app.post("/", function (req, res) {
  const listTitle = req.body.list;

  const newItemDoc = new Item({
    name: req.body.newItem
  })//make document from item posted 

  if (listTitle === "Today") {
    newItemDoc.save();//insert new item in DB
    res.redirect("/");
  } else {
    List.findOneAndUpdate({ name: listTitle }, { $push: { "items": newItemDoc } }, function (err) {
      if (err) { console.log(err); }
    })
    res.redirect("/" + listTitle);
  }
});

app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;//give's id when checkbox is checked
  const listName = req.body.listName;//give's name when listName is checked
  
  if (listName === "Today") {
    Item.deleteOne({ _id: checkItemId }, function (err) {
      if (err) { console.log(err); }
    })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { "items": {_id :checkItemId}} }, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    })

  }

});



app.get("/:listName", function (req, res) {
  const customListName = _.capitalize(req.params.listName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
        //this we create a new list
      }
      else {
        // console.log(foundList); //this were we display list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      };
    }
  })
});


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000 , function () {
  console.log("Server started !!!");
});
