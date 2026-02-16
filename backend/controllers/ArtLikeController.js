import ArtLike from '../model/ArtLikeModel.js';

class ArtLikeController {

  static async getByUserIdAndArtId(req, res) {
    try {
      const { user_id } = req.user;
      const { art_id } = req.params;

      const like = await ArtLike.getByUserIdAndArtId({ art_id, user_id });

      return res.status(200).json({
        message: 'List of all likes',
        liked: !!like
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByArtId(req, res) {
    try {
      const { art_id } = req.params;

      const likes = await ArtLike.getByArtId(art_id);

      return res.status(200).json({
        message: 'List of all likes',
        total: likes.length,
        data: likes
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id } = req.user;   
      const { art_id } = req.params;

      if (!art_id) {
        return res.status(400).json({ message: 'art_id is required' });
      }

      const existing = await ArtLike.getByUserIdAndArtId({ art_id, user_id });

      if (existing) {
        return res.status(409).json({ message: 'Already liked' });
      }

      const like = await ArtLike.create({ art_id, user_id });

      return res.status(201).json({
        message: 'Like created successfully',
        data: like
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { user_id } = req.user;
      const { art_id } = req.params;

      const deleted = await ArtLike.delete({ art_id, user_id });

      if (!deleted) {
        return res.status(404).json({ message: 'Like not found' });
      }

      return res.status(200).json({
        message: 'deleted successfully',
        data: deleted
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

}

export default ArtLikeController;