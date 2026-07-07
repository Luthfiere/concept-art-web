import Message from '../model/MessageModel.js';
import Conversation from '../model/ConversationModel.js';
import { resolveAttachmentType } from '../middlewares/multerMessageAttachment.js';

class MessageController {

  static async getByConversationId(req, res) {
    const { conversation_id } = req.params;
    const { user_id } = req.user;
    const { limit = 50, offset = 0 } = req.query;

    try {
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

    const hasText = message && message.trim().length > 0;
    const hasFiles = req.files && req.files.length > 0;

    if (!hasText && !hasFiles) {
      return res.status(400).json({ message: 'Message text or at least one attachment is required' });
    }

    if (hasText && message.length > 1000) {
      return res.status(400).json({ message: 'Message must not exceed 1000 characters' });
    }

    try {
      const conversation = await Conversation.getById(conversation_id, user_id);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const newMessage = await Message.create({
        conversation_id,
        sender_id: user_id,
        message: hasText ? message.trim() : null,
      });

      if (hasFiles) {
        await Promise.all(
          req.files.map((file) =>
            MessageAttachment.create({
              message_id: newMessage.id,
              attachment_type: resolveAttachmentType(file.originalname),
              media: file.path.replace(/\\/g, '/'),
            })
          )
        );
      }

      await Conversation.updateTimestamp(conversation_id);

      const fullMessage = await Message.getById(newMessage.id);

      res.status(201).json({
        message: 'Message sent successfully',
        data: fullMessage,
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

  static async deleteAttachment(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.user;

      const attachment = await MessageAttachment.getById(id);
      if (!attachment) {
        return res.status(404).json({ message: 'Attachment not found' });
      }

      const parentMessage = await Message.getById(attachment.message_id);
      if (!parentMessage || parentMessage.sender_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this attachment' });
      }

      const deleted = await MessageAttachment.delete(id);
      res.status(200).json({ message: 'Attachment deleted successfully', data: deleted });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }  

}

export default MessageController;