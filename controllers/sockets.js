const User = require('../models/user');
const Message = require('../models/message');
const ObjectId = require('mongodb').ObjectId;



const connectedUser = async (uid = '') => {
    const user = await User.findById(uid);
    user.online = true;
    await user.save();
    return user;
}

const disconnectedUser = async (uid = '') => {
    const user = await User.findById(uid);
    user.online = false;
    await user.save();
    return user;
}

const getUsers = async () => {
    const users = await User
        .find()
        .sort('-online');
    return users;
}

const getLastMessages = async (uid) => {

    // objectId deprecated solution
    const uidObj = ObjectId.createFromHexString(uid)

    const lastMessages = await Message.aggregate([
        {
            $match: {
                $or: [
                    { from: uidObj }, 
                    { to: uidObj }
                ]
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ["$from", uidObj] }, "$to", "$from"
                    ]
                },
                lastMessage: { $first: "$message" },
                lastMessageId: { $first: "$_id" },  // Get messageId
                lastMessageCreatedAt: { $first: "$createdAt" }  // Get createdAt
            }
        }
    ]);

    return lastMessages.map(msg => ({
        uid: msg._id,
        message: msg.lastMessage,
        messageId: msg.lastMessageId  ,
        createdAt: msg.lastMessageCreatedAt
    }));
};

const getUnseenMessages = async (uid) => {
    const unseenMessages = await Message.aggregate([
        {
            $match: {
                to: ObjectId.createFromHexString(uid),  // messages to user
                seen: false  // only unseen messages
            }
        },
        {
            $group: {
                _id: "$from",  // Group by sender
                count: { $sum: 1 }  // Count unseen messages 
            }
        }
    ]);

    return unseenMessages.map(msg => ({
        uid: msg._id,
        count: msg.count
    }));
};

const deleteUser = async (uid) => {

    const user = await User.findByIdAndDelete(uid);
    if (!user) {
        return false;
    }
    const uidObj = ObjectId.createFromHexString(uid)
    await Message.deleteMany({ $or: [{ from: uidObj }, { to: uidObj }] });

    return true;

};

const markMessagesAsSeen = async (from, to) => {
    await Message.updateMany({
        from: ObjectId.createFromHexString(from),
        to: ObjectId.createFromHexString(to),
        seen: false
    }, { $set: { seen: true } });
};

const markOneMessageAsSeen = async (messageId) => {
    await Message.findByIdAndUpdate(messageId, { seen: true });
};


const recordMessage = async (payload) => {

    try {
        const message = new Message(payload);
        await message.save();
        return message;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    connectedUser,
    disconnectedUser,
    getUsers,
    getLastMessages,
    getUnseenMessages,
    deleteUser,
    markMessagesAsSeen,
    markOneMessageAsSeen,
    recordMessage,
}