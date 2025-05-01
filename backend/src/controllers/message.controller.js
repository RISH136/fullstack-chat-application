import User from "../models/user.model.js"
import Messages from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/Socket.js";
import { io } from "../lib/Socket.js";


export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getMessages = async (req, res) => {
    try {
        const { id: usertoChatId } = req.params;
        const myId = req.user._id;

        const message = await Messages.find({
            $or: [
                { senderId: myId, receiverId: usertoChatId },
                { senderId: usertoChatId, receiverId: myId }
            ],
        })
        res.status(200).json(message);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });

    }

}

export const sendMessage = async (req, res) => {
    try {
        const { image, text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Messages({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })
        await newMessage.save();

        //todo - realtime message Exchange
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }


        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });

    }

}