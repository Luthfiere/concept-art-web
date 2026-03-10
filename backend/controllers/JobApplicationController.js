import JobApplication from '../model/JobApplicationModel.js';
import JobPosting from '../model/JobPostingModel.js';

class JobApplicationController {

  static async getByJobId(req, res) {
    try {
      const { job_id } = req.params;
      const applications = await JobApplication.getByJobId(job_id);

      return res.status(200).json({
        message: 'List of applications for this job',
        total: applications.length,
        data: applications
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getByApplicant(req, res) {
    try {
      const { user_id } = req.user;
      const applications = await JobApplication.getByApplicant(user_id);

      return res.status(200).json({
        message: 'List of your applications',
        total: applications.length,
        data: applications
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id } = req.user;
      const { job_id } = req.params;
      const { cover_letter } = req.body;
      const cv = req.file ? req.file.path : null;

      const job = await JobPosting.getById(job_id);

      if (!job) {
        return res.status(404).json({ message: 'Job posting not found' });
      }

      if (job.status !== 'Active') {
        return res.status(400).json({ message: 'Job posting is not active' });
      }

      const existing = await JobApplication.getByJobAndApplicant({ job_id, applicant_id: user_id });

      if (existing) {
        return res.status(409).json({ message: 'You have already applied for this job' });
      }

      const application = await JobApplication.create({
        job_id,
        applicant_id: user_id,
        cover_letter,
        cv
      });

      return res.status(201).json({
        message: 'Application submitted successfully',
        data: application
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.user;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const app = await JobApplication.getById(id);

      if (!app) {
        return res.status(404).json({ message: 'Application not found' });
      }

      const job = await JobPosting.getById(app.job_id);

      if (!job || job.user_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to update this application' });
      }

      const updated = await JobApplication.updateStatus(id, status);

      return res.status(200).json({
        message: 'Application status updated successfully',
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

      const deleted = await JobApplication.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Application not found' });
      }

      if (deleted.applicant_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this application' });
      }

      return res.status(200).json({
        message: 'Application deleted successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

}

export default JobApplicationController;
