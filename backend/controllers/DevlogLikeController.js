import DevLogLike from '../model/DevlogLikeModel.js';
import DevLog from '../model/DevlogModel.js';

class DevLogLikeController {

  static async getByLogId(req, res) {
    try {
      const { log_id } = req.params;

      const likes = await DevLogLike.getByLogId(log_id);

      return res.status(200).json({
        message: 'List of likes for this dev log',
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
      const { log_id } = req.params;

      const liked = await DevLogLike.isLiked(log_id, user_id);

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
      const { log_id } = req.body;

      if (!log_id) {
        return res.status(400).json({ message: 'log_id is required' });
      }

      const log = await DevLog.getById(log_id);
      if (!log) {
        return res.status(404).json({ message: 'Dev log not found' });
      }

      const existing = await DevLogLike.isLiked(log_id, user_id);

      if (existing) {
        return res.status(409).json({ message: 'Already liked' });
      }

      const like = await DevLogLike.like({ log_id, user_id });

      return res.status(201).json({
        message: 'Dev log liked successfully',
        data: like
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async unlike(req, res) {
    try {
      const { user_id } = req.user;
      const { log_id } = req.body;

      if (!log_id) {
        return res.status(400).json({ message: 'log_id is required' });
      }

      const log = await DevLog.getById(log_id);
      if (!log) {
        return res.status(404).json({ message: 'Dev log not found' });
      }

      const deleted = await DevLogLike.unlike({ log_id, user_id });

      if (!deleted) {
        return res.status(404).json({ message: 'Like not found' });
      }

      return res.status(200).json({
        message: 'Dev log unliked successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default DevLogLikeController;