import Comment from '../model/CommentModel.js';

class CommentController {

  static async getByEntityId(req, res) {
    try {
      const { entity_type, entity_id } = req.params;

      const comments = await Comment.getByEntityId(entity_type, entity_id);

      return res.status(200).json({
        message: `List of comments`,
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

      const comment = await Comment.getById(id);

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
      const { entity_type, entity_id } = req.params;
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

      const created = await Comment.create(entity_type, entity_id, user_id, comment.trim());
      const newComment = await Comment.getById(created.id);

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

      const existing = await Comment.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to update this comment' });
      }

      const updated = await Comment.update(id, comment.trim());

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

      const existing = await Comment.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }

      const deleted = await Comment.delete(id);

      return res.status(200).json({
        message: 'Comment deleted successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default CommentController;
