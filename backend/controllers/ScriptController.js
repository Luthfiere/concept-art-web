import ScriptingQuestion from '../model/ScriptModel.js';

class ScriptController {

  static async getAll(req, res) {
    try {
      const questions = await ScriptingQuestion.getAll();
      return res.status(200).json({
        message: 'List of all scripting questions',
        total: questions.length,
        data: questions,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const question = await ScriptingQuestion.getById(id);

      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      return res.status(200).json({
        message: 'Question details',
        data: question,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const questions = await ScriptingQuestion.getByUser(user_id);
      return res.status(200).json({
        message: 'List of questions by user',
        total: questions.length,
        data: questions,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id } = req.user;
      const { title, content, code_snippet, tag } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: 'title and content are required' });
      }

      const question = await ScriptingQuestion.create({
        user_id, title, content, code_snippet, tag,
      });

      return res.status(201).json({
        message: 'Question posted successfully',
        data: question,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.user;
      const { title, content, code_snippet, tag } = req.body;

      const existing = await ScriptingQuestion.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to update this question' });
      }

      const fields = {};
      if (title) fields.title = title;
      if (content) fields.content = content;
      if (code_snippet !== undefined) fields.code_snippet = code_snippet;
      if (tag !== undefined) fields.tag = tag;

      const updated = await ScriptingQuestion.update(id, fields);

      return res.status(200).json({
        message: 'Question updated successfully',
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const { user_id, role } = req.user;

      const existing = await ScriptingQuestion.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const isOwner = existing.user_id === user_id;
      const isModerator = role === 'moderator';

      if (!isOwner && !isModerator) {
        return res.status(403).json({ message: 'Not authorized to delete this question' });
      }

      const deleted = await ScriptingQuestion.delete(id);

      return res.status(200).json({
        message: 'Question deleted successfully',
        data: deleted,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async incrementView(req, res) {
    try {
      const { id } = req.params;
      const updated = await ScriptingQuestion.incrementViews(id);

      if (!updated) {
        return res.status(404).json({ message: 'Question not found' });
      }

      return res.status(200).json({
        message: 'View recorded',
        views: updated.views,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default ScriptController;