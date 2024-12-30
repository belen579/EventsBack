const Message = require('./models/Message');

const messageController = {
  // Fetch messages with populated author details
  async getMessages(req, res) {
    try {
      const groupId = req.params.groupId;

      // Fetch messages and populate author details
      const messages = await Message.find({ group: groupId })
        .populate('author', 'firstname lastname') // Populate firstname and lastname of the author
        .populate('group') // Optional, if you need group details

        .exec(); // Ensures the query runs properly

      console.log('Populated Messages:', JSON.stringify(messages, null, 2)); // Debugging

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ message: 'Error getting messages', error });
    }
  },

  // Create a new message and emit it via Socket.IO
  async createMessage(req, res, io) {
    try {
      const { content, authorId, groupId } = req.body;

      const newMessage = new Message({
        content,
        author: authorId,
        group: groupId,
      });

      await newMessage.save();

      // Populate the author details
      const populatedMessage = await newMessage.populate('author', 'firstname lastname');

      // Emit the message with full author details
      io.to(groupId).emit('receiveMessage', {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        groupId: populatedMessage.group,
        sender: {
          firstname: populatedMessage.author.firstname,
          lastname: populatedMessage.author.lastname,
        },
        timestamp: populatedMessage.timestamp,
      });

      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ message: 'Error creating message', error });
    }
  },
};

module.exports = new messageController();
