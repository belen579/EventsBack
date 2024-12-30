const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: { type: String, required: true }, 
  description: { type: String, required: true }, 
  photo: {type: String},
  user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  

});

module.exports = mongoose.model("Blog", blogSchema);