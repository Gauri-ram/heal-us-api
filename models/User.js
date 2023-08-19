const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String, required: true, max: 1024, min: 6},
    usn: {type: String, required: true},
    age: {type: Number},
    mobileNo: {type: String},
    password: {type: String, required: true, max: 1024, min: 6},
    tokens:[{token: {type: String, required: true}}] 
});

UserSchema.methods.generateAuthToken = async function () {
    let token = jwt.sign({_id: this._id}, process.env.TOKEN);
    this.tokens = this.tokens.concat({ token : token });
    await this.save();
    return token;
}

const User = mongoose.model("User", UserSchema);

module.exports = User;