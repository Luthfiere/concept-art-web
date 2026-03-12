import Conversation from '../model/ConversationModel.js';
import ConceptArt from '../model/ConceptArtModel.js';

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
    const { art_id, receiver_id } = req.body;
    const { user_id } = req.user;

    if (!art_id || !receiver_id) {
      return res.status(400).json({ message: 'art_id and receiver_id are required' });
    }

    if (user_id === receiver_id) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    try {
      // Check if art exists
      const art = await ConceptArt.getById(art_id);
      if (!art) {
        return res.status(404).json({ message: 'Concept art not found' });
      }

      // Check if conversation already exists
      const existing = await Conversation.getByArtAndUsers({
        art_id,
        sender_id: user_id,
        receiver_id
      });

      if (existing) {
        return res.status(200).json({
          message: 'Conversation already exists',
          conversation: existing
        });
      }

      const newConversation = await Conversation.create({
        art_id,
        sender_id: user_id,
        receiver_id
      });

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