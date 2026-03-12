import DevLogComment from '../model/DevlogCommentModel.js';
import DevLog from '../model/DevlogModel.js';

class DevLogCommentController {

  static async getByLogId(req, res) {
    try {
      const { log_id } = req.params;

      const comments = await DevLogComment.getByLogId(log_id);

      return res.status(200).json({
        message: 'List of comments for this dev log',
        total: comments.length,
        data: comments
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const comment = await DevLogComment.getById(id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      return res.status(200).json({
        message: 'Comment details',
        data: comment
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id } = req.user;
      const { log_id } = req.params;
      const { comment } = req.body;

      if (!comment) {
        return res.status(400).json({ message: 'Comment is required' });
      }

      if (comment.trim().length === 0) {
        return res.status(400).json({ message: 'Comment cannot be empty' });
      }

      if (comment.length > 500) {
        return res.status(400).json({ message: 'Comment must not exceed 500 characters' });
      }

      const log = await DevLog.getById(log_id);
      if (!log) {
        return res.status(404).json({ message: 'Dev log not found' });
      }

      const newComment = await DevLogComment.create({
        log_id,
        user_id,
        comment: comment.trim()
      });

      return res.status(201).json({
        message: 'Comment created successfully',
        data: newComment
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { user_id } = req.user;
      const { id } = req.params;
      const { comment } = req.body;

      if (!comment) {
        return res.status(400).json({ message: 'Comment is required' });
      }

      if (comment.trim().length === 0) {
        return res.status(400).json({ message: 'Comment cannot be empty' });
      }

      if (comment.length > 500) {
        return res.status(400).json({ message: 'Comment must not exceed 500 characters' });
      }

      const existing = await DevLogComment.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to update this comment' });
      }

      const updated = await DevLogComment.update(id, comment.trim());

      return res.status(200).json({
        message: 'Comment updated successfully',
        data: updated
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { user_id } = req.user;
      const { id } = req.params;

      const existing = await DevLogComment.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }

      const deleted = await DevLogComment.delete(id);

      return res.status(200).json({
        message: 'Comment deleted successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default DevLogCommentController;