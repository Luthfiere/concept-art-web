const EditArtModal = ({ form, setForm, onClose, onSubmit }) => {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        e.stopPropagation(); // 🔥 penting
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()} // 🔥 tambah ini juga
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-4 font-bold">Edit Art</h2>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        >
          <option value="">Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>

        <input
          name="tag"
          value={form.tag}
          onChange={handleChange}
          placeholder="Tag"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full mb-4 p-2 bg-[#0a0d1a] pointer-events-auto"
        >
          <option value="">Category</option>
          <option value="art">Art</option>
          <option value="post">Post</option>
          <option value="community">Community</option>
        </select>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-white/10 p-2">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-amber-400 text-black p-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditArtModal