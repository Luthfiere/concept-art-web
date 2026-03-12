import JobPosting from '../model/JobPostingModel.js';

function parseDateDMY(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('-');
  return new Date(`${year}-${month}-${day}`).toISOString();
}

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
      const { user_id } = req.user;
      const { title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const job = await JobPosting.create({
        user_id, title, description, job_location,
        work_option, work_type, salary_min, salary_max,
        salary_currency, status, expired_at: parseDateDMY(expired_at)
      });

      return res.status(201).json({
        message: 'Job posting created successfully',
        data: job
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
      if (expired_at !== undefined) fields.expired_at = parseDateDMY(expired_at);

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
