import ArtMedia from '../model/ArtMediaModel.js';

class ArtMediaController {

  static async getByArtId(req, res) {
    try {
      const { art_id } = req.params;

      const media = await ArtMedia.getByArtId(art_id);
      return res.status(200).json({ 
        message: 'List of media for the art',
        data: media 
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { art_id, media } = req.body;

      if (!art_id || !media) {
        return res.status(400).json({
          message: 'art_id and media are required'
        });
      }

      const newMedia = await ArtMedia.create({ art_id, media });

      return res.status(201).json({
        message: 'Media created successfully',
        data: newMedia
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deleted = await ArtMedia.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Media not found' });
      }

      return res.status(200).json({
        message: 'Media deleted successfully',
        data: deleted
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default ArtMediaController;
