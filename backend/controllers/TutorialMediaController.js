import TutorialMedia from '../model/TutorialMediaModel.js';
import Tutorial from '../model/TutorialModel.js';

class TutorialMediaController {

  static async getByTutorialId(req, res) {
    try {
      const { tutorial_id } = req.params;
      const media = await TutorialMedia.getByTutorialId(tutorial_id);

      return res.status(200).json({
        message: 'List of media for this tutorial',
        total: media.length,
        data: media,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { tutorial_id } = req.params;
      const { role } = req.user;

      if (role !== 'moderator') {
        return res.status(403).json({ message: 'Only moderators can upload tutorial media' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'media files are required' });
      }

      const tutorial = req._tutorial || await Tutorial.getById(tutorial_id);
      if (!tutorial) {
        return res.status(404).json({ message: 'Tutorial not found' });
      }

      const mediaData = await Promise.all(
        req.files.map(file =>
          TutorialMedia.create({
            tutorial_id,
            media: file.path.replace(/\\/g, '/'),
          })
        )
      );

      return res.status(201).json({
        message: 'Media uploaded successfully',
        data: mediaData,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.user;

      if (role !== 'moderator') {
        return res.status(403).json({ message: 'Only moderators can delete tutorial media' });
      }

      const deleted = await TutorialMedia.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Media not found' });
      }

      return res.status(200).json({
        message: 'Media deleted successfully',
        data: deleted,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default TutorialMediaController;