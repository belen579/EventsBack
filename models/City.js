const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CitySchema = new Schema({
    name: { type: String, required: true }, 
    state: { type: String },
    country: { type: String}, 
});

module.exports = mongoose.model("City", CitySchema);