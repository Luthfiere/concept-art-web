import ContentReport from '../model/ContentReportModel.js';
import ModerationAction from '../model/ModerationActionModel.js';
import { getEntity, deleteEntity, SUPPORTED_ENTITIES } from '../utils/entityResolver.js';

const VALID_REASONS = ['off_scope', 'spam', 'scam', 'duplicate', 'inappropriate', 'other'];

class ModerationController {

  static async getQueue(req, res) {
    try {
      const queue = await ContentReport.getQueueGrouped();
      return res.status(200).json({ message: 'Moderation queue', total: queue.length, data: queue });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async deleteEntity(req, res) {
    try {
      const { user_id } = req.user;
      const { entity_type, entity_id } = req.params;
      const { reason, note } = req.body;

      if (!SUPPORTED_ENTITIES.includes(entity_type)) {
        return res.status(400).json({ message: 'Unsupported entity_type' });
      }
      if (!reason || !VALID_REASONS.includes(reason)) {
        return res.status(400).json({ message: 'A valid reason is required' });
      }

      const id = Number(entity_id);
      const entity = await getEntity(entity_type, id);
      if (!entity) {
        return res.status(404).json({ message: 'Content not found' });
      }

      // Snapshot title + author before delete cascades the row away
      await ModerationAction.create({
        moderator_id: user_id,
        target_user_id: entity.user_id,
        entity_type,
        entity_id: id,
        entity_title_snapshot: entity.title || null,
        reason,
        note: note || null,
      });

      await ContentReport.deleteByEntity(entity_type, id);
      const deleted = await deleteEntity(entity_type, id);

      return res.status(200).json({
        message: 'Content deleted',
        data: { entity_type, entity_id: id, deleted },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { entity_type, entity_id } = req.params;

      if (!SUPPORTED_ENTITIES.includes(entity_type)) {
        return res.status(400).json({ message: 'Unsupported entity_type' });
      }

      const id = Number(entity_id);
      await ContentReport.deleteByEntity(entity_type, id);

      return res.status(200).json({
        message: 'Reports dismissed',
        data: { entity_type, entity_id: id },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default ModerationController;
