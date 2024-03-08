const express = require("express");
const isauthcontroller = require("../midlewares/isauth");
const router = express.Router();
const chats = require("../control/chatscontroller");
router.get("/getchats", isauthcontroller.isauth, chats.getchats);
router.post("/addchat", isauthcontroller.isauth, chats.addchat);
router.post("/sendmsg", isauthcontroller.isauth, chats.sendmsg);
// router.get("/getchats/:chatername",getonechat)

module.exports = router;
//isauthcontroller.isauth,
