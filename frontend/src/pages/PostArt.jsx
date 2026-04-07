import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const PostArt = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must login first!");
      navigate("/login");
    }
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Open",
    tag: "",
    category: "art",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    let files = Array.from(e.target.files);

    if (files.length > 6) {
      alert("Max 6 images!");
      files = files.slice(0, 6);
    }

    setImages(files);
    setPreview(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      alert("Title wajib diisi");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // 1️⃣ CREATE ART

      const res = await fetch("http://localhost:5000/api/concept-arts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const artId = data.art.id;

      // 2️⃣ UPLOAD MULTIPLE IMAGES (SEKALIGUS)
      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((img) => {
          formData.append("media", img); // 🔥 HARUS "media"
        });

        const resUpload = await fetch(
          `http://localhost:5000/api/art-media/art/${artId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        const uploadData = await resUpload.json();
        if (!resUpload.ok) throw new Error(uploadData.message);
      }

      alert("Art + images uploaded!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal upload");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  return (
    <div className="min-h-screen bg-[#0b0f2a] text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto p-10">
        <h1 className="text-2xl font-bold mb-6">Post New Art</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 bg-[#1b1f3a] rounded"
          />
          {/* 🔥 JUMLAH IMAGE */}
          <p className="text-sm text-gray-400 mt-2">
            {images.length} / 6 images selected
          </p>

          {/* 🔥 PREVIEW + SPACING */}
          <div className="flex gap-3 flex-wrap mt-3">
            {preview.map((src, i) => (
              <img
                key={i}
                src={src}
                className="w-24 h-24 object-cover rounded-lg hover:scale-105 transition duration-200 cursor-pointer"
              />
            ))}
          </div>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#1b1f3a]"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#1b1f3a]"
          />

          <input
            name="tag"
            placeholder="Tag (e.g. Fantasy)"
            value={form.tag}
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#1b1f3a]"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#1b1f3a]"
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black py-3 rounded font-semibold"
          >
            Submit Art
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostArt;
