const Message = require('../models/message');


const getChat = async (req, res) => {

    const myId = req.uid;
    const messagesFrom = req.params.from;

    const last30 = await Message.find({
        $or: [
            { from: myId, to: messagesFrom }, 
            { from: messagesFrom, to: myId }
        ]
    })
        .sort({ createdAt: 'desc' })
        .limit(30);

    const last30Reverse = last30.reverse();

    res.json({
        ok: true,
        messages: last30Reverse
    });

}

const updateSeenMessage = async (req, res) => {

    const messageId = req.id;

    const message = await Message.findByIdAndUpdate(messageId, { seen: true });

    res.json({
        ok: true,
        message
    });

}

module.exports = {
    getChat,
    updateSeenMessage
}