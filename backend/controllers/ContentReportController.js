import ContentReport from '../model/ContentReportModel.js';
import { getEntity, SUPPORTED_ENTITIES } from '../utils/entityResolver.js';

const VALID_REASONS = ['off_scope', 'spam', 'scam', 'duplicate', 'inappropriate', 'other'];

class ContentReportController {

  static async create(req, res) {
    try {
      const { user_id } = req.user;
      const { entity_type, entity_id, reason, note } = req.body;

      if (!entity_type || !entity_id || !reason) {
        return res.status(400).json({ message: 'entity_type, entity_id and reason are required' });
      }
      if (!SUPPORTED_ENTITIES.includes(entity_type)) {
        return res.status(400).json({ message: 'Unsupported entity_type' });
      }
      if (!VALID_REASONS.includes(reason)) {
        return res.status(400).json({ message: 'Invalid reason' });
      }

      const entity = await getEntity(entity_type, Number(entity_id));
      if (!entity) {
        return res.status(404).json({ message: 'Reported content not found' });
      }
      if (entity.user_id === user_id) {
        return res.status(403).json({ message: 'You cannot report your own content' });
      }

      let report;
      try {
        report = await ContentReport.create({
          entity_type,
          entity_id: Number(entity_id),
          reporter_id: user_id,
          reason,
          note: note || null,
        });
      } catch (err) {
        if (err.code === '23505') {
          return res.status(409).json({ message: 'You have already reported this content' });
        }
        throw err;
      }

      return res.status(201).json({
        message: 'Report submitted',
        data: report,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default ContentReportController;
