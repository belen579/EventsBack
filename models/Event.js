
const mongoose = require("mongoose");


const Schema = mongoose.Schema;
const EventSchema = new Schema({
  title: { type: String, required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  description: { type: String, required: true },
  administrator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateTime: { type: Date, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  photos: [{ type: String }] // array photos (url, path...)
  
});

module.exports = mongoose.model("Event", EventSchema);