const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  chats: [
    {
      chetterID: String,
      lastmsg: String,
      unseenMsgs: Number,
      chatID: {
        type: String,
        required: true,
      },
    },
  ],
});

// Virtual field to get an array of user IDs from the concatenated chatID
userSchema.virtual("userIDs").get(function () {
  return this.chats.map((chat) => chat.chetterID).sort();
});

// Set the chatID field based on lexicographically smaller user IDs
userSchema.pre("save", function (next) {
  this.chats.forEach((chat) => {
    const [smallerID, largerID] = [this._id, chat.chetterID].sort();
    chat.chatID = `${smallerID}${largerID}`;
  });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
