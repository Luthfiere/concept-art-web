import DevLogMedia from '../model/DevlogMediaModel.js';
import DevLog from "../model/DevlogModel.js";


class DevLogMediaController {

  static async getByLogId(req, res) {
    try {
      const { log_id } = req.params;

      const media = await DevLogMedia.getByLogId(log_id);

      return res.status(200).json({
        message: 'List of media for this dev log',
        total: media.length,
        data: media
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { log_id } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Media files are required' });
      }

      const log = await DevLog.getById(log_id);

      if (!log) {
        return res.status(404).json({ message: 'Dev log not found' });
      }

      if (log.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized to upload media to this dev log' });
      }

      const mediaData = await Promise.all(
        req.files.map(file =>
          DevLogMedia.create({
            log_id,
            media: file.path.replace(/\\/g, '/')
          })
        )
      );

      return res.status(201).json({
        message: 'Media uploaded successfully',
        data: mediaData
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.user;

      const media = await DevLogMedia.getById(id);

      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }

      const log = await DevLog.getById(media.log_id);

      if (!log || log.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this media' });
      }

      const deleted = await DevLogMedia.delete(id);

      return res.status(200).json({
        message: 'Media deleted successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default DevLogMediaController;