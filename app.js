const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override")
const ejsmate = require("ejs-mate");

app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsmate);

async function main() {
  await mongoose.connect('mongodb://localhost:27017/Nivas');
}

main().then(()=>{
    console.log("connection to db successful");
}).catch(err => {
    console.log(err);
})

// let sampleListing = new Listing({
//     title : "My dream home",
//     description : "Beyond mountains",
//     price : 12000,
//     location : "Ladakh",
//     country : "India",
// });

// sampleListing.save();

//index route
app.get("/getlistings",async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("listing.ejs",{allListings});
})


//create new route
app.get("/listings/new",(req,res)=>{
    res.render("new.ejs");
})

//read request
app.get("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    let allinfo = await Listing.findById(id);
    res.render("show.ejs",{allinfo});
})

//add new info
app.post("/listings",async (req,res)=>{
    let {title , description,image ,price,location,country} = req.body;
    let newListing = new Listing({
        title : title,
        description : description,
        image : image,
        prrice : price,
        location : location,
        country : country,
    });
    await newListing.save();
    res.redirect("/getlistings");
})

//edit route
app.get("/listings/:id/edit",async (req,res)=>{
    const {id} = req.params;
    let data = await Listing.findById(id);
    res.render("edit.ejs",{data});
})

//update route
app.put("/listings/:id",async (req,res)=>{
    const {id} = req.params;
    let { title, description, image, price, location, country } = req.body;
    await Listing.findByIdAndUpdate(id,{title : title,
        description : description,
        price : price,
        location : location,
        country : country,});

    res.redirect(`/listings/${id}`);
})

app.delete("/listings/:id",async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/getListings");
})

app.get("/",(req,res)=>{
    res.send("everything is fine");
})
app.listen(8080,(req,res)=>{
    console.log("app is listening");
})