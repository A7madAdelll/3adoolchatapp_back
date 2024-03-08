const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  _id: {
    type: String,

    unique: true,
  },
  user1ID: String,
  user2ID: String,
  user1name: String,
  user2name: String,

  messages: [
    {
      senderID: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

// Virtual field to get an array of user IDs from the concatenated _id
chatSchema.virtual("userIDs").get(function () {
  return [this.user1ID, this.user2ID];
});

// Set the _id field based on lexicographically smaller user IDs
chatSchema.pre("save", function (next) {
  const [smallerID, largerID] = this.userIDs.sort(); // Sorting user IDs
  this._id = `${smallerID}${largerID}`;
  next();
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
