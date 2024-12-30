const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const LocationSchema = new Schema({
    name: { type: String, required: false },
    address: { type: String}, 
    city: {type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    state:{type:String},
    country:{type:String}, 
    postalcode:{type:String}


  });
  
  module.exports = mongoose.model("Location", LocationSchema);