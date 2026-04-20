import JobReport from '../model/JobReportModel.js';
import JobPosting from '../model/JobPostingModel.js';
import { reportAction, THRESHOLDS } from '../services/reportThresholdService.js';

const VALID_REASONS = ['off_scope', 'spam', 'scam', 'duplicate', 'inappropriate', 'other'];

class JobReportController {

  static async create(req, res) {
    try {
      const { user_id } = req.user;
      const { job_id, reason, note } = req.body;

      if (!job_id || !reason) {
        return res.status(400).json({ message: 'job_id and reason are required' });
      }

      if (!VALID_REASONS.includes(reason)) {
        return res.status(400).json({ message: 'Invalid reason' });
      }

      const job = await JobPosting.getById(job_id);
      if (!job) {
        return res.status(404).json({ message: 'Job posting not found' });
      }

      if (job.user_id === user_id) {
        return res.status(400).json({ message: 'You cannot report your own posting' });
      }

      let report;
      try {
        report = await JobReport.create({ job_id, reporter_id: user_id, reason, note: note || null });
      } catch (err) {
        if (err.code === '23505') {
          return res.status(409).json({ message: 'You have already reported this posting' });
        }
        throw err;
      }

      const count = await JobReport.countByJobId(job_id);
      const action = reportAction(count);

      const stateUpdate = {
        report_count: count,
        warned_at: null,
        status: null,
      };

      if (action?.warn && !job.warned_at) {
        stateUpdate.warned_at = new Date().toISOString();
      }
      if (action?.status) {
        stateUpdate.status = action.status;
      }

      const updated = await JobPosting.updateReportState(job_id, stateUpdate);

      return res.status(201).json({
        message: 'Report submitted',
        data: {
          report,
          job: {
            id: updated.id,
            status: updated.status,
            report_count: updated.report_count,
            warned_at: updated.warned_at,
          },
          thresholds: THRESHOLDS,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByJobId(req, res) {
    try {
      const { user_id } = req.user;
      const { job_id } = req.params;

      const job = await JobPosting.getById(job_id);
      if (!job) {
        return res.status(404).json({ message: 'Job posting not found' });
      }

      if (job.user_id !== user_id) {
        return res.status(403).json({ message: 'Only the posting owner can view reports' });
      }

      const count = await JobReport.countByJobId(job_id);
      const breakdown = await JobReport.reasonBreakdown(job_id);

      return res.status(200).json({
        message: 'Report summary',
        data: { count, breakdown, thresholds: THRESHOLDS },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default JobReportController;
