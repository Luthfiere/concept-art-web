import { useState } from "react";
import axios from "axios";

const JobDetail = ({ job }) => {

  const [file, setFile] = useState(null);
  const token = localStorage.getItem("access_token");

  if (!job) return null;

  const applyJob = async () => {

    const formData = new FormData();
    formData.append("cv", file);

    await axios.post(
      `http://localhost:3000/api/job-applications/job/${job.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    alert("Application sent!");
  };

  return (
    <div className="col-span-8 bg-[#1a1d2e] p-6 rounded-lg">

      <h2 className="text-xl font-bold mb-2">
        {job.title}
      </h2>

      <p className="text-gray-400 mb-4">
        {job.company} • {job.location}
      </p>

      <p className="text-gray-300 mb-6 whitespace-pre-line">
        {job.description}
      </p>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={applyJob}
        className="bg-yellow-500 text-black px-6 py-2 rounded"
      >
        Apply
      </button>

    </div>
  );

};

export default JobDetail;