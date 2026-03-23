import Like from '../model/LikeModel.js';

class LikeController {

  static async getByEntityId(req, res) {
    try {
      const { entity_type, entity_id } = req.params;

      const likes = await Like.getByEntityId(entity_type, entity_id);

      return res.status(200).json({
        message: `List of likes`,
        total: likes.length,
        data: likes
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async isLiked(req, res) {
    try {
      const { user_id } = req.user;
      const { entity_type, entity_id } = req.params;

      const liked = await Like.isLiked(entity_type, entity_id, user_id);

      return res.status(200).json({
        message: 'Like status',
        liked: !!liked
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async like(req, res) {
    try {
      const { user_id } = req.user;
      const { entity_type, entity_id } = req.body;

      if (!entity_type || !entity_id) {
        return res.status(400).json({ message: 'entity_type and entity_id are required' });
      }

      const existing = await Like.isLiked(entity_type, entity_id, user_id);

      if (existing) {
        return res.status(409).json({ message: 'Already liked' });
      }

      const like = await Like.like(entity_type, entity_id, user_id);

      return res.status(201).json({
        message: 'Liked successfully',
        data: like
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async unlike(req, res) {
    try {
      const { user_id } = req.user;
      const { entity_type, entity_id } = req.body;

      if (!entity_type || !entity_id) {
        return res.status(400).json({ message: 'entity_type and entity_id are required' });
      }

      const deleted = await Like.unlike(entity_type, entity_id, user_id);

      if (!deleted) {
        return res.status(404).json({ message: 'Like not found' });
      }

      return res.status(200).json({
        message: 'Unliked successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default LikeController;
