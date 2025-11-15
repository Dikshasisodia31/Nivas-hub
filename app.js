const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override")
const ejsmate = require("ejs-mate");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

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

app.get("/demouser",async (req,res)=>{
    let fakeUser = new User({
        email : "student@gmail.com",
        username:"delta-student",
    });
    let registeredUser = await User.register(fakeUser,"helloworld"); // hello world is our pass it get converted to hash function so that nobody can know what was the original pass is
    res.send(registeredUser);
})

app.get("/signup",(req,res)=>{
    res.render("users/signup",{showsearchbar:false});
})

app.post("/signup",async(req,res)=>{
    try{
       let {username,email,password} = req.body;
       if(!password){
         return res.status(400).send("password missing");
       }
       const newUser = new User({email,username});
       const registeredUser = await User.register(newUser,password);
       console.log(registeredUser);
       res.redirect("/getlistings");
    }catch(err){
         console.log(err);
         res.status(500).send(err.message);
    }
})

app.get("/login",(req,res)=>{
    res.render("users/login.ejs",{showsearchbar:false});
})

app.post("/login",
    passport.authenticate("local",{
        failureRedirect : "/login",
        failureFlash:true,
    }),
    async(req,res)=>{
        res.send("Welcome to Wanderlust!You are logged in!");
    }
)

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/getlistings",{showsearchbar:false});
    })
})

//index route
app.get("/getlistings",async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("listing.ejs",{allListings,showsearchbar:true});
})

//create new route
app.get("/listings/new",(req,res)=>{
    res.render("new.ejs",{showsearchbar:false});
})

//read request
app.get("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    let allinfo = await Listing.findById(id);
    res.render("show.ejs",{allinfo,showsearchbar:false});
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
    res.redirect("/getlistings",{showsearchbar:true});
})

//edit route
app.get("/listings/:id/edit",async (req,res)=>{
    const {id} = req.params;
    let data = await Listing.findById(id);
    res.render("edit.ejs",{data,showsearchbar:false});
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
    res.redirect("/getlistings",{showsearchbar:true});
    // res.send("everything is fine");
})
app.listen(8080,(req,res)=>{
    console.log("app is listening");
})