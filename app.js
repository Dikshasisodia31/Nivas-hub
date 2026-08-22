if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override")
const ejsmate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsmate);
passport.use(new LocalStrategy.Strategy(User.authenticate()));

const store = new MongoStore({
  mongoUrl: "mongodb://localhost:27017/Nivas",
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("Session store error:", err);
});
const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// CONNECT-SESSION
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

async function main() {
  await mongoose.connect('mongodb://localhost:27017/Nivas');
}

main().then(()=>{
    console.log("connection to db successful");
}).catch(err => {
    console.log(err);
})

//FLASH 
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    next();
});

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
function isLoggedIn(req,res,next){
    if(!req.isAuthenticated()){
       req.flash("error","You must be logged in before making any changes");
       return res.redirect("/login");
    }
    next();
}
app.get("/login",(req,res)=>{
    res.render("users/login.ejs",{showsearchbar:false});
})

app.post("/login",
    passport.authenticate("local",{
        failureRedirect : "/login",
        failureFlash:true,
    }),
    async(req,res)=>{
        res.redirect("/getlistings");
    }
)

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        res.redirect("/getlistings",{showsearchbar:false});
    })
})

//index route
app.get("/getlistings",async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("listing.ejs",{allListings,showsearchbar:true});
})

//create new route
app.get("/listings/new",isLoggedIn,(req,res)=>{
    res.render("new.ejs",{showsearchbar:false});
})

//read request
app.get("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    let allinfo = await Listing.findById(id);
    res.render("show.ejs",{allinfo,showsearchbar:false});
})

//add new info
app.post("/listings",isLoggedIn,async (req,res)=>{
    let {title , description,image ,price,location,country} = req.body;
    let newListing = new Listing({
        title : title,
        description : description,
        image : image,
        price : price,
        location : location,
        country : country,
    });
    await newListing.save();
    res.redirect("/getlistings",{showsearchbar:true});
})

//edit route
app.get("/listings/:id/edit",isLoggedIn,async (req,res)=>{
    const {id} = req.params;
    let data = await Listing.findById(id);
    res.render("edit.ejs",{data,showsearchbar:false});
})

//update route
app.put("/listings/:id",isLoggedIn,async (req,res)=>{
    const {id} = req.params;
    let { title, description, image, price, location, country } = req.body;
    await Listing.findByIdAndUpdate(id,{title : title,
        description : description,
        price : price,
        location : location,
        country : country,});

    res.redirect(`/listings/${id}`);
})

app.delete("/listings/:id",isLoggedIn,async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/getListings");
})

app.get("/",(req,res)=>{
    res.redirect("/getlistings",{showsearchbar:true});
    // res.send("everything is fine");
})

app.listen(PORT,(req,res)=>{
    console.log("app is listening");
})