import { useState } from "react";
import api from "../../services/api";

const JobDetail = ({ job }) => {
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  if (!job) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only PDF, DOC, and DOCX files are allowed!");
      return;
    }

    // max 2MB (optional tapi bagus)
    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB!");
      return;
    }

    setFile(selectedFile);
  };

  const applyJob = async () => {
    if (!file) {
      alert("Please upload your CV first!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("cv", file);
      formData.append("cover_letter", coverLetter);

      await api.post(`/job-applications/job/${job.id}`, formData);

      alert("Application sent!");
      setFile(null);
      setCoverLetter("");
    } catch (err) {
      alert(err.response?.data?.message || "Error applying job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-8 bg-[#1a1d2e] p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-2">{job.title}</h2>

      <p className="text-gray-400 mb-4">
        {job.company} • {job.location}
      </p>

      <p className="text-gray-300 mb-6 whitespace-pre-line">
        {job.description}
      </p>

      {/* Cover Letter */}
      <textarea
        placeholder="Write your cover letter..."
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
        className="w-full mb-4 p-3 rounded bg-[#0f1323]"
      />

      {/* Upload CV */}
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Button */}
      <button
        onClick={applyJob}
        disabled={loading}
        className={`px-6 py-2 rounded ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-yellow-500 text-black"
        }`}
      >
        {loading ? "Submitting..." : "Apply"}
      </button>
    </div>
  );
};

export default JobDetail;