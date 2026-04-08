import { useState } from "react";
import api from "../../services/api";

const WORK_OPTION = ["On-site", "Hybrid", "Remote"];
const WORK_TYPE = ["Full-time", "Part-time", "Contract", "Casual"];
const JOB_STATUS = ["Draft", "Active", "Expired", "Blocked"];

const PostJobForm = () => {
  
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    job_location: "",
    work_option: "Hybrid",
    work_type: "Full-time",
    salary_min: "",
    salary_max: "",
    salary_currency: "IDR",
    status: "Active",
    expired_at: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (e) => {
    // convert YYYY-MM-DD → DD-MM-YYYY
    const formatted = e.target.value.split("-").reverse().join("-");
    setForm({
      ...form,
      expired_at: formatted
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/job-postings", form);

      alert("Job posted successfully!");

      setForm({
        title: "",
        description: "",
        job_location: "",
        work_option: "Hybrid",
        work_type: "Full-time",
        salary_min: "",
        salary_max: "",
        salary_currency: "IDR",
        status: "Active",
        expired_at: ""
      });

    } catch (error) {
      console.log(error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to post job");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1a1d2e] p-6 rounded-lg space-y-4 max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-bold">Post a Job</h2>

      {/* Title */}
      <input
        name="title"
        placeholder="Job Title"
        value={form.title}
        onChange={handleChange}
        className="w-full bg-[#0f1323] p-3 rounded"
        required
      />

      {/* Location */}
      <input
        name="job_location"
        placeholder="Job Location"
        value={form.job_location}
        onChange={handleChange}
        className="w-full bg-[#0f1323] p-3 rounded"
      />

      {/* Description */}
      <textarea
        name="description"
        placeholder="Job Description"
        value={form.description}
        onChange={handleChange}
        className="w-full bg-[#0f1323] p-3 rounded h-32"
      />

      {/* Work Option */}
      <select
        name="work_option"
        value={form.work_option}
        onChange={handleChange}
        className="w-full bg-[#0f1323] p-3 rounded"
      >
        {WORK_OPTION.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      {/* Work Type */}
      <select
        name="work_type"
        value={form.work_type}
        onChange={handleChange}
        className="w-full bg-[#0f1323] p-3 rounded"
      >
        {WORK_TYPE.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      {/* Salary */}
      <div className="flex gap-4">
        <input
          type="number"
          name="salary_min"
          placeholder="Min Salary"
          value={form.salary_min}
          onChange={handleChange}
          className="w-full bg-[#0f1323] p-3 rounded"
        />

        <input
          type="number"
          name="salary_max"
          placeholder="Max Salary"
          value={form.salary_max}
          onChange={handleChange}
          className="w-full bg-[#0f1323] p-3 rounded"
        />
      </div>

      {/* Currency */}
      <input
        name="salary_currency"
        value={form.salary_currency}
        onChange={handleChange}
        className="w-full bg-[#0f1323] p-3 rounded"
      />

      {/* Status */}
      <input
        name="status"
        value={form.status}
        onChange={handleChange}
        readOnly
        className="w-full bg-[#0f1323] p-3 rounded cursor-not-allowed"
      >
      </input>

      {/* Expired Date */}
      <input
        type="date"
        onChange={handleDateChange}
        className="w-full bg-[#0f1323] p-3 rounded"
      />

      {/* Submit */}
      <button
        type="submit"
        className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-400"
      >
        Post Job
      </button>
    </form>
  );
};

export default PostJobForm;