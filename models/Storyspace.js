const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
   displayName: String,
  username: String,
  verified: Boolean,
  text: String,
  avatar: String,
  image: String,
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;