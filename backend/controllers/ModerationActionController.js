import ModerationAction from '../model/ModerationActionModel.js';

class ModerationActionController {

  static async getMine(req, res) {
    try {
      const { user_id } = req.user;
      const actions = await ModerationAction.getUndismissedByUser(user_id);
      return res.status(200).json({ message: 'Pending moderation notices', data: actions });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async dismiss(req, res) {
    try {
      const { user_id } = req.user;
      const { id } = req.params;
      const dismissed = await ModerationAction.dismiss(Number(id), user_id);
      if (!dismissed) {
        return res.status(404).json({ message: 'Notice not found or already dismissed' });
      }
      return res.status(200).json({ message: 'Dismissed', data: dismissed });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default ModerationActionController;
