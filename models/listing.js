const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title : String,
    description : String,
    image : {
       filename : String,
       url : String,
    },
    price : Number,
    location : String,
    country : String,
})

const Listing = mongoose.model("Listing",listingSchema);// database m jo collection banega bo listings ke naam se hoga
module.exports = Listing;