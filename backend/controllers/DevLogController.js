import DevLog from "../model/DevlogModel.js";

class DevLogController {

  static async getAll(req, res) {
    try {
      const logs = await DevLog.getAll();

      return res.status(200).json({
        message: 'List of all dev logs',
        total: logs.length,
        data: logs
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const log = await DevLog.getById(id);

      if (!log) {
        return res.status(404).json({ message: 'Dev log not found' });
      }

      if (log.status !== 'Published' && log.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized to view this dev log' });
      }

      return res.status(200).json({
        message: 'Dev log details',
        data: log
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const isOwner = req.user.user_id === parseInt(user_id);

      const logs = isOwner
        ? await DevLog.getByUser(user_id)
        : await DevLog.getByUserPublic(user_id);

      return res.status(200).json({
        message: 'List of dev logs by user',
        total: logs.length,
        data: logs
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByUserPublic(req, res) {
    try {
      const { user_id } = req.params;
      const logs = await DevLog.getByUserPublic(user_id);

      return res.status(200).json({
        message: 'List of published dev logs by user',
        total: logs.length,
        data: logs
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByCategory(req, res) {
    try {
      const { category } = req.params;

      const logs = await DevLog.getByCategory(category);

      return res.status(200).json({
        message: `List of dev logs with category: ${category}`,
        total: logs.length,
        data: logs
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id } = req.user;
      const { title, content, category, genre, tag, status } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'title is required' });
      }

      const cover_image = req.file
        ? req.file.path.replace(/\\/g, '/')
        : null;

      const newLog = await DevLog.create({
        user_id,
        title,
        content,
        cover_image,
        category,
        genre,
        tag,
        status
      });

      return res.status(201).json({
        message: 'Dev log created successfully',
        data: newLog
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.user;
      const { title, content, category, genre, tag, status } = req.body;

      const existing = await DevLog.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Dev log not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to update this dev log' });
      }

      const fields = {};
      if (title)    fields.title    = title;
      if (content)  fields.content  = content;
      if (category) fields.category = category;
      if (genre)    fields.genre    = genre;
      if (tag)      fields.tag      = tag;
      if (status)   fields.status   = status;

      if (req.file) {
        fields.cover_image = req.file.path.replace(/\\/g, '/');
      }

      const updated = await DevLog.update(id, fields);

      return res.status(200).json({
        message: 'Dev log updated successfully',
        data: updated
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.user;

      const existing = await DevLog.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Dev log not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this dev log' });
      }

      const deleted = await DevLog.delete(id);

      return res.status(200).json({
        message: 'Dev log deleted successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async incrementView(req, res) {
    try {
      const { id } = req.params;

      const updated = await DevLog.incrementViews(id);

      if (!updated) {
        return res.status(404).json({ message: 'Dev log not found' });
      }

      return res.status(200).json({
        message: 'View recorded',
        views: updated.views
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default DevLogController;