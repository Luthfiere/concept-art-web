import Message from '../model/MessageModel.js';
import Conversation from '../model/ConversationModel.js';

class MessageController {

  static async getByConversationId(req, res) {
    const { conversation_id } = req.params;
    const { user_id } = req.user;
    const { limit = 50, offset = 0 } = req.query;

    try {
      // Check if user is part of conversation
      const conversation = await Conversation.getById(conversation_id, user_id);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const messages = await Message.getByConversationId(conversation_id, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Mark messages as read
      await Message.markAsRead(conversation_id, user_id);

      res.status(200).json({
        message: 'List of all messages',
        total: messages.length,
        messages
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;

    try {
      const message = await Message.getById(id);

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      res.status(200).json({
        message: 'Message details',
        data: message
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    const { conversation_id } = req.params;
    const { message } = req.body;
    const { user_id } = req.user;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: 'Message must not exceed 1000 characters' });
    }

    try {
      // Check if user is part of conversation
      const conversation = await Conversation.getById(conversation_id, user_id);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const newMessage = await Message.create({
        conversation_id,
        sender_id: user_id,
        message: message.trim()
      });

      // Update conversation timestamp
      await Conversation.updateTimestamp(conversation_id);

      res.status(201).json({
        message: 'Message sent successfully',
        data: newMessage
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getUnreadCount(req, res) {
    const { user_id } = req.user;

    try {
      const count = await Message.getUnreadCount(user_id);

      res.status(200).json({
        message: 'Unread message count',
        count
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    const { user_id } = req.user;

    try {
      const deletedMessage = await Message.delete(id, user_id);

      if (!deletedMessage) {
        return res.status(404).json({ message: 'Message not found or not authorized' });
      }

      res.status(200).json({
        message: 'Message deleted successfully',
        data: deletedMessage
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

}

export default MessageController;