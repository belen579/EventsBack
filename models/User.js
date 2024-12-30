// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "images/Perfil_image.jpg", required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  preferedCity: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  categoryName: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
  dayOfTheWeek: { type: String, default: 'Monday' },
  subscription:{type: Boolean, default: false},
  isAdministrator: { type: Boolean, default: false },
  requiresOnboarding: { type: Boolean, default: true },
  suscription:{type:Boolean, default:false},
  organizedEvents: { type: Number, default: 0 },
  interestedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  joinedEvents: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },

});

module.exports = mongoose.model('User', userSchema);
