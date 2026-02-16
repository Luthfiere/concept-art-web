import ArtComment from '../model/ArtCommentModel.js';

class ArtCommentController {

  static async getByArtId(req, res) {
    try {
      const { art_id } = req.params;

      const comments = await ArtComment.getByArtId(art_id);

      return res.status(200).json({
        message: 'List of all comments',
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

      const comment = await ArtComment.getById(id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      return res.status(200).json({ 
        message: 'List of all comments',
        data: comment 
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id } = req.user;
      const { art_id } = req.params;
      const { comment } = req.body;

      if (!comment) {
        return res.status(400).json({ message: 'Comment is required' });
      }

      if (comment.trim().length === 0) {
        return res.status(400).json({ message: 'Comment cannot be empty' });
      }

      if (comment.length > 300) {
        return res.status(400).json({ message: 'Comment must not exceed 300 characters' });
      }      

      const newComment = await ArtComment.create({
        art_id,
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

      if (comment.length > 300) {
        return res.status(400).json({ message: 'Comment must not exceed 300 characters' });
      }

      const updated = await ArtComment.update(id, user_id, { comment: comment.trim() });

      if (!updated) {
        return res.status(404).json({ message: 'Comment not found or not owner' });
      }

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

      const deleted = await ArtComment.delete(id, user_id);

      if (!deleted) {
        return res.status(404).json({ message: 'Comment not found or not owner' });
      }

      return res.status(200).json({
        message: 'Comment deleted successfully',
        data: deleted
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

}

export default ArtCommentController;