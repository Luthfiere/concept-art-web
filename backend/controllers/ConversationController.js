import Conversation from '../model/ConversationModel.js';
import User from '../model/UserModel.js';

class ConversationController {

  static async getAll(req, res) {
    const { user_id } = req.user;
    const { limit = 20, offset = 0 } = req.query;

    try {
      const conversations = await Conversation.getAll(user_id, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({
        message: 'List of all conversations',
        total: conversations.length,
        conversations
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    const { user_id } = req.user;

    try {
      const conversation = await Conversation.getById(id, user_id);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      res.status(200).json({
        message: 'Conversation details',
        conversation
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    const { receiver_id } = req.body;
    const { user_id, role } = req.user;
    const receiverId = parseInt(receiver_id);

    if (!receiverId) {
      return res.status(400).json({ message: 'receiver_id is required' });
    }

    if (user_id === receiverId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    try {
      const [user_a_id, user_b_id] = user_id < receiverId
        ? [user_id, receiverId]
        : [receiverId, user_id];

      const existing = await Conversation.getByUsers(user_a_id, user_b_id);
      if (existing) {
        const full = await Conversation.getById(existing.id, user_id);
        return res.status(200).json({
          message: 'Conversation already exists',
          conversation: full
        });
      }

      // Gate new conversation creation on receiver's collaboration_status.
      // Moderators bypass so support stays reachable.
      if (role !== 'moderator') {
        const receiver = await User.getProfile(receiverId);
        if (!receiver) {
          return res.status(404).json({ message: 'User not found' });
        }
        if (receiver.collaboration_status === 'closed') {
          return res.status(403).json({ message: 'This user is not accepting new messages' });
        }
      }

      const newConversation = await Conversation.create({ user_a_id, user_b_id });

      res.status(201).json({
        message: 'Conversation created successfully',
        conversation: newConversation
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    const { user_id } = req.user;

    try {
      const deletedConversation = await Conversation.delete(id, user_id);

      if (!deletedConversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      res.status(200).json({
        message: 'Conversation deleted successfully',
        conversation: deletedConversation
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

}

export default ConversationController;
