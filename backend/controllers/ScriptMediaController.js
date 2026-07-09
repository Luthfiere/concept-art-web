import ScriptingMedia from '../model/SriptMediaModel.js';
import ScriptingQuestion from '../model/ScriptModel.js';

class ScriptingMediaController {

  static async getByQuestionId(req, res) {
    try {
      const { question_id } = req.params;
      const media = await ScriptingMedia.getByQuestionId(question_id);

      return res.status(200).json({
        message: 'List of files for this question',
        total: media.length,
        data: media,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { question_id } = req.params;
      const { user_id } = req.user;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'code files are required' });
      }

      const question = req._question || await ScriptingQuestion.getById(question_id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (question.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to attach files to this question' });
      }

      const mediaData = await Promise.all(
        req.files.map(file =>
          ScriptingMedia.create({
            question_id,
            media: file.path.replace(/\\/g, '/'),
            original_name: file.originalname,
          })
        )
      );

      return res.status(201).json({
        message: 'Files uploaded successfully',
        data: mediaData,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const { user_id, role } = req.user;

      const media = await ScriptingMedia.getById(id);
      if (!media) {
        return res.status(404).json({ message: 'File not found' });
      }

      const question = await ScriptingQuestion.getById(media.question_id);
      const isOwner = question && question.user_id === user_id;
      const isModerator = role === 'moderator';

      if (!isOwner && !isModerator) {
        return res.status(403).json({ message: 'Not authorized to delete this file' });
      }

      const deleted = await ScriptingMedia.delete(id);

      return res.status(200).json({
        message: 'File deleted successfully',
        data: deleted,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default ScriptingMediaController;