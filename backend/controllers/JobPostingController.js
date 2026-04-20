import JobPosting from '../model/JobPostingModel.js';
import Subscription from '../model/SubscriptionModel.js';
import { THRESHOLDS } from '../services/reportThresholdService.js';

const ACTIVE_POST_CAP = { pro: 3, corporate: 15 };
const MIN_TITLE_LENGTH = 8;
const MAX_TITLE_LENGTH = 100;

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

const EDITABLE_FIELDS = [
  'title', 'description', 'job_location', 'work_option', 'work_type',
  'salary_min', 'salary_max', 'salary_currency', 'expired_at',
];

class JobPostingController {

  static async getAll(req, res) {
    try {
      const jobs = await JobPosting.getAll();

      return res.status(200).json({
        message: 'List of all job postings',
        total: jobs.length,
        data: jobs
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const job = await JobPosting.getById(id);

      if (!job) {
        return res.status(404).json({ message: 'Job posting not found' });
      }

      return res.status(200).json({
        message: 'Job posting detail',
        data: job
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const jobs = await JobPosting.getByUser(user_id);

      return res.status(200).json({
        message: 'List of job postings by user',
        total: jobs.length,
        data: jobs
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const jobs = await JobPosting.getByStatus(status);

      return res.status(200).json({
        message: `List of ${status} job postings`,
        total: jobs.length,
        data: jobs
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id, role } = req.user;
      const { title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const trimmedTitle = String(title).trim();
      if (trimmedTitle.length < MIN_TITLE_LENGTH || trimmedTitle.length > MAX_TITLE_LENGTH) {
        return res.status(400).json({
          message: `Title must be ${MIN_TITLE_LENGTH}-${MAX_TITLE_LENGTH} characters`,
        });
      }

      // Only count active-post cap if publishing directly (Active) — Drafts don't count
      const intendedStatus = status || 'Draft';
      if (intendedStatus === 'Active') {
        const cap = ACTIVE_POST_CAP[role];
        if (cap !== undefined) {
          const activeCount = await JobPosting.countActiveByUser(user_id);
          if (activeCount >= cap) {
            return res.status(400).json({
              message: `Active post limit reached (${cap}). Close an existing posting to publish a new one.`,
            });
          }
        }
      }

      const job = await JobPosting.create({
        user_id,
        title: trimmedTitle,
        description,
        job_location,
        work_option,
        work_type,
        salary_min,
        salary_max,
        salary_currency,
        status,
        expired_at: parseDate(expired_at),
      });

      // If the user's active subscription is a per-post plan, consume one credit now
      if (req._perPostSub) {
        await Subscription.decrementPostsRemaining(req._perPostSub.id);
      }

      return res.status(201).json({
        message: 'Job posting created successfully',
        data: job,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.user;
      const { title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at } = req.body;

      const existing = await JobPosting.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Job posting not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to update this job posting' });
      }

      const fields = {};
      if (title) fields.title = title;
      if (description !== undefined) fields.description = description;
      if (job_location !== undefined) fields.job_location = job_location;
      if (work_option) fields.work_option = work_option;
      if (work_type) fields.work_type = work_type;
      if (salary_min !== undefined) fields.salary_min = salary_min;
      if (salary_max !== undefined) fields.salary_max = salary_max;
      if (salary_currency) fields.salary_currency = salary_currency;
      if (status) fields.status = status;
      if (expired_at !== undefined) fields.expired_at = parseDate(expired_at);

      const touchedFields = Object.keys(fields);
      const hasNonStatusEdit = touchedFields.some((k) => EDITABLE_FIELDS.includes(k));

      if (existing.status === 'Active' && hasNonStatusEdit) {
        if ((existing.report_count ?? 0) < THRESHOLDS.WARN) {
          return res.status(400).json({
            message: 'Active postings cannot be edited. Close the post and repost to make changes.',
          });
        }
        fields.status = 'Draft';
        fields.report_count = 0;
        fields.warned_at = null;
      }

      const updated = await JobPosting.update(id, fields);

      return res.status(200).json({
        message: 'Job posting updated successfully',
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

      const existing = await JobPosting.getById(id);

      if (!existing) {
        return res.status(404).json({ message: 'Job posting not found' });
      }

      if (existing.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this job posting' });
      }

      const deleted = await JobPosting.delete(id);

      return res.status(200).json({
        message: 'Job posting deleted successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

}

export default JobPostingController;
