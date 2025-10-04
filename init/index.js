const mongoose = require("mongoose");
const Listing = require("../models/listing.js"); // it consist the database collection where is data going to be store
const initData = require("./data.js"); // it consist our sample listings
async function main() {
  await mongoose.connect('mongodb://localhost:27017/Nivas');
}

main().then(()=>{
    console.log("connection to db successful");
}).catch(err => {
    console.log(err);
})

const initDB = async () =>{
    await Listing.deleteMany({}); // in case there may be old data present
    await Listing.insertMany(initData.data);
    console.log("data is entered succesfully");
}

initDB();