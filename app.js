const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));

mongoose.connect("mongodb+srv://abdulshahid:Test1234@cluster0.1taewgl.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true})
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true});


const itemsSchema = new mongoose.Schema({
    name: String
})

// var listItems = ["Do ton of programming","Hit the Gym","Take nutrition"]
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name: "Welcome to your To-Do-List! "
})
const item2 = new Item({
    name: "Hit the + button to add a new Item "
})
const item3 = new Item({
    name: "Press <-- to delete Item "
})


var defaultItems = [item1,item2,item3];
const listsSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});
const List = mongoose.model("List",listsSchema);

// Item.insertMany([item1,item2,item3]).then(function () {
//         console.log("Successfully saved defult items to DB");
//       }).catch(function (err) {
//         console.log(err);
//       });

    //   Item.find({}).then(function(foundItems){
    //     console.log(foundItems);
    //   })
    //   .catch(function(err){
    //     console.log(err);
    //   });


    

var workItems = [];
app.get("/",function(req,res){

     var day = date.getDate();

     Item.find({}).then(function(foundItems){
        if(foundItems.length===0){
            Item.insertMany([item1,item2,item3]).then(function () {
        console.log("Successfully saved defult items to DB");
      }).catch(function (err) {
        console.log(err);
      });
        
        res.redirect("/");
    }
    else{
        res.render("list",{listTitle: day,newListItems: foundItems});
    }
      
  
   
}); 
});
app.post("/",function(request,response){
    var day = date.getDate();
    const itemName = request.body.item;
    const listName = request.body.list;
    const item = new Item({
        name: itemName
    })

    if(listName===day){
        item.save();
        response.redirect("/");
    }
    else{
       List.findOne({name: listName}).then(function(foundList){
        foundList.items.push(item)
        foundList.save();
        response.redirect("/"+listName)
       } 
    
       ).catch(function (err) {
        console.log(err);
      });
    }
    








 
//  if(request.body.list==="Work List"){
//     workItems.push(listItem);
//     response.redirect("/work");
//  }
//  else{
//     listItems.push(listItem);
//     response.redirect("/");
//  }
});

app.post("/delete",async function(request,response){
    var day = date.getDate();

    const checkedItemId = (request.body.checkbox);
    const listName = request.body.listName;
    if(listName === day){
        if(checkedItemId!= undefined){
            await Item.findByIdAndRemove(checkedItemId)
            .then(()=>console.log(`Deleted ${checkedItemId} Successfully`))
            
            .catch((err) => console.log("Deletion Error: " + err));
        }
        response.redirect("/");
    }
    else{
      List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemId}}}).then(function(){
        response.redirect("/" + listName);
      }).catch(function(err){
        console.log(err);
      })

    }


}); 






// app.post("/delete", function(req, res){
//     var day = date.getDate();

//     const checkedItem = req.body.checkbox;
//     const listName = req.body.listName;
  
//    if(listName === day){
//      Item.deleteOne({_id: checkedItem}).then(function () {
//          console.log("Successfully deleted");
//          res.redirect("/");
//       })
//       .catch(function (err) {
//          console.log(err);
//        });
//    }else{
//      let doc =  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItem}}}, {
//          new: true
//        }).then(function (foundList)
//        {
//          res.redirect("/" + listName);
//        }).catch( err => console.log(err));
//    }
//  })



app.get("/:customListName",async function(req,res){
    const customListName = _.capitalize(req.params.customListName);
     await List.findOne({name: customListName})
        .then((foundList)=>{
    // if(!err){
        if(!foundList){
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            
            list.save();
            res.redirect("/"+customListName)
        }
        else{
            res.render("list",{listTitle: foundList.name,newListItems: foundList.items});
        }
    // }
})
.catch((err) => console.log("Deletion Error: " + err));





const list = new List({
    name: customListName,
    items: defaultItems
});

list.save();
});




app.get("/about",function(req,res){
    res.render("about");
})


app.listen(3000,function(){
    console.log("Server started at port 3000");
}) 