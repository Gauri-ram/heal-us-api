const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

const ContactUsSchema = new Schema({
    name: {type: String},
    email: {type: String, required: true, match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/},
    subject: {type: String},
    message: {type: String},
    sendCopy: { type: Boolean, default: false },
});

const ContactUs = mongoose.model("ContactUs", ContactUsSchema);

module.exports = ContactUs;