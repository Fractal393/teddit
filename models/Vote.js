const mongoose  = require("mongoose");

const schema = new mongoose.Schema({
  author: {type:String,required:true},
  commentId: {type:mongoose.ObjectId,required:false},
  direction: {type:Number,required:true}
});
const Vote = mongoose.model('Vote', schema);

module.exports = Vote;