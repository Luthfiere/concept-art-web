import { useState } from "react";
import axios from "axios";

const PostJobForm = () => {

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("access_token");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:3000/api/job-postings",
        {
          title,
          company,
          location,
          description
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Job posted successfully!");

      setTitle("");
      setCompany("");
      setLocation("");
      setDescription("");

    } catch (error) {

      console.log(error);
      alert("Failed to post job");

    }

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1a1d2e] p-6 rounded-lg space-y-4"
    >

      <input
        type="text"
        placeholder="Job Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-[#0f1323] p-3 rounded"
        required
      />

      <input
        type="text"
        placeholder="Company Name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="w-full bg-[#0f1323] p-3 rounded"
        required
      />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full bg-[#0f1323] p-3 rounded"
        required
      />

      <textarea
        placeholder="Job Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-[#0f1323] p-3 rounded h-40"
        required
      />

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