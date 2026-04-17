import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const API_BASE = "http://localhost:5000/api";

export default function DevlogDetail() {
  const { id } = useParams();
  const [log, setLog] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/devlogs/${id}`)
      .then((res) => res.json())
      .then((data) => setLog(data.devlog));
  }, [id]);

  if (!log) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="bg-[#0f111a] min-h-screen text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* COVER */}
        {log.cover_image && (
          <img
            src={log.cover_image}
            className="w-full h-64 object-cover rounded-xl mb-6"
          />
        )}

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-3">{log.title}</h1>

        {/* META */}
        <p className="text-sm text-gray-500 mb-6">
          {log.author} •{" "}
          {new Date(log.created_at).toLocaleDateString()}
        </p>

        {/* CONTENT */}
        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
          {log.content}
        </div>
      </div>
    </div>
  );
}