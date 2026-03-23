import Forum from '../model/ForumModel.js';

class ForumController {

  static async getAll(req, res) {
    try {
      const posts = await Forum.getAll();

      return res.status(200).json({
        message: 'List of all forum posts',
        total: posts.length,
        data: posts
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const post = await Forum.getById(id);

      if (!post) {
        return res.status(404).json({ message: 'Forum post not found' });
      }

      return res.status(200).json({
        message: 'Forum post details',
        data: post
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByUser(req, res) {
    try {
      const { user_id } = req.params;

      const posts = await Forum.getByUser(user_id);

      return res.status(200).json({
        message: 'List of forum posts by user',
        total: posts.length,
        data: posts
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id } = req.user;
      const { title, description, type } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const image = req.file
        ? req.file.path.replace(/\\/g, '/')
        : null;

      const newPost = await Forum.create({
        user_id,
        title,
        description,
        type,
        image
      });

      return res.status(201).json({
        message: 'Forum post created successfully',
        data: newPost
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.user;
      const { title, description, type } = req.body;

      const existing = await Forum.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Forum post not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to update this post' });
      }

      const fields = {};
      if (title)       fields.title = title;
      if (description) fields.description = description;
      if (type)        fields.type = type;

      if (req.file) {
        fields.image = req.file.path.replace(/\\/g, '/');
      }

      const updated = await Forum.update(id, fields);

      return res.status(200).json({
        message: 'Forum post updated successfully',
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

      const existing = await Forum.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Forum post not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this post' });
      }

      const deleted = await Forum.delete(id);

      return res.status(200).json({
        message: 'Forum post deleted successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default ForumController;
