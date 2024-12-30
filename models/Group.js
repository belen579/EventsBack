const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const GroupSchema = new Schema({
  Users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  interestedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});


module.exports = mongoose.model("Group", GroupSchema);