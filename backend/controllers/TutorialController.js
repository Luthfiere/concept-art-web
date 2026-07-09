import Tutorial from '../model/TutorialModel.js';

class TutorialController {

  static async getAll(req, res) {
    try {
      const tutorials = await Tutorial.getAll();
      return res.status(200).json({
        message: 'List of all tutorials',
        total: tutorials.length,
        data: tutorials,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const tutorial = await Tutorial.getById(id);

      if (!tutorial) {
        return res.status(404).json({ message: 'Tutorial not found' });
      }

      return res.status(200).json({
        message: 'Tutorial details',
        data: tutorial,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const tutorials = await Tutorial.getByUser(user_id);
      return res.status(200).json({
        message: 'List of tutorials by user',
        total: tutorials.length,
        data: tutorials,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id, role } = req.user;
      const { title, content, tag, reference_url } = req.body;

      if (role !== 'moderator') {
        return res.status(403).json({ message: 'Only moderators can post tutorials' });
      }

      if (!title || !content) {
        return res.status(400).json({ message: 'title and content are required' });
      }

      const tutorial = await Tutorial.create({ user_id, title, content, tag, reference_url });

      return res.status(201).json({
        message: 'Tutorial created successfully',
        data: tutorial,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.user;
      const { title, content, tag, reference_url } = req.body;

      if (role !== 'moderator') {
        return res.status(403).json({ message: 'Only moderators can edit tutorials' });
      }

      const existing = await Tutorial.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Tutorial not found' });
      }

      const fields = {};
      if (title) fields.title = title;
      if (content) fields.content = content;
      if (tag !== undefined) fields.tag = tag;
      if (reference_url !== undefined) fields.reference_url = reference_url;

      const updated = await Tutorial.update(id, fields);

      return res.status(200).json({
        message: 'Tutorial updated successfully',
        data: updated,
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
        return res.status(403).json({ message: 'Only moderators can delete tutorials' });
      }

      const deleted = await Tutorial.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Tutorial not found' });
      }

      return res.status(200).json({
        message: 'Tutorial deleted successfully',
        data: deleted,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async incrementView(req, res) {
    try {
      const { id } = req.params;
      const updated = await Tutorial.incrementViews(id);

      if (!updated) {
        return res.status(404).json({ message: 'Tutorial not found' });
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

export default TutorialController;