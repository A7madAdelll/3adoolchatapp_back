const User = require("../models/user");
const Chat = require("../models/chat");
const io = require("../socket");
exports.getchats = async (req, res, next) => {
  try {
    const user = await User.findById(req._id);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const chatIds = user.chats.map((chat) => chat.chatID);

    const chats = await Chat.find({ _id: { $in: chatIds } });

    res
      .status(200)
      .json({ message: "Chats retrieved successfully", chats: chats });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.addchat = async (req, res, next) => {
  console.log(io);
  console.log("Addchat");
  try {
    const socketIdMap = require("../usersmap");
    console.log(socketIdMap);
    const foundedUser = await User.findById(req._id);
    const chatterfounded = await User.findOne({ email: req.body.chatteremail });

    if (!chatterfounded) {
      const error = new Error("Chatter not found");
      error.statusCode = 404;
      throw error;
    }

    const newchat = new Chat({
      user1ID: req._id,
      user2ID: chatterfounded._id,
      user1name: foundedUser.name,
      user2name: chatterfounded.name,
      // _id: "1",
      messages: [],
    });

    await newchat.save().then((p) => {
      console.log(newchat);
      foundedUser.chats.push({
        chetterID: chatterfounded._id,
        lastmsg: "",
        unseenMsgs: 0,
        chatID: newchat._id,
      });
    });

    await foundedUser.save();

    chatterfounded.chats.push({
      chetterID: req._id,
      lastmsg: "",
      unseenMsgs: 0,
      chatID: newchat._id,
    });

    await chatterfounded.save();

    console.log(
      "here is the get contacts",
      chatterfounded._id,
      socketIdMap,
      socketIdMap.get(`${chatterfounded._id}`)
    );

    if (socketIdMap.get(`${chatterfounded._id}`)) {
      io.getIO()
        .to(socketIdMap.get(`${chatterfounded._id}`))
        .to(socketIdMap.get(`${req._id}`))
        .emit("chats", {
          action: "chatadded",
          chat: newchat,
        });
    }

    // io.getIO().emit("chats", { action: "chatadded", chat: newchat });
    res
      .status(201)
      .json({ message: "Chat created successfully", chat: newchat });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.sendmsg = (req, res, next) => {
  const socketIdMap = require("../usersmap");
  let chatterid;
  Chat.findById(req.body.chatID)
    .then((chat) => {
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      if (chat.user1ID == req._id) chatterid = chat.user2ID;
      else {
        chatterid = chat.user1ID;
      }
      // Add the new message to the chat
      chat.messages.push({
        senderID: req._id,
        content: req.body.content,
      });

      // Save the changes to the database
      return chat.save();
    })
    .then((updatedChat) => {
      console.log(chatterid, socketIdMap.get(`${chatterid}`));
      if (socketIdMap.get(`${chatterid}`)) {
        io.getIO()
          .to(socketIdMap.get(`${chatterid}`))
          .emit("chats", {
            action: "msgadded",
            msg: {
              senderID: req._id,
              content: req.body.content,
            },
          });
      }

      // io.getIO().emit("chats", {
      //   action: "msgadded",
      //   msg: {
      //     senderID: req._id,
      //     content: req.body.content,
      //   },
      // });
      res
        .status(200)
        .json({ message: "Message sent successfully", chat: updatedChat });
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Internal server error" });
    });
};
