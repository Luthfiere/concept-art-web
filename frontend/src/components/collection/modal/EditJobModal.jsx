const EditJobModal = ({ form, setForm, onClose, onSubmit }) => {
  const tomorrowISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

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
        className="w-full max-w-lg bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-4 font-bold">Edit Job</h2>

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

        <input
          name="job_location"
          value={form.job_location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <select
          name="work_option"
          value={form.work_option}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a]"
        >
          <option value="">Work Option</option>
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>

        <select
          name="work_type"
          value={form.work_type}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a]"
        >
          <option value="">Work Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Casual">Casual</option>
        </select>

        <div className="flex gap-2 mb-3">
          <input
            name="salary_min"
            value={form.salary_min}
            onChange={handleChange}
            placeholder="Min"
            className="w-1/2 p-2 bg-[#0a0d1a] pointer-events-auto"
          />
          <input
            name="salary_max"
            value={form.salary_max}
            onChange={handleChange}
            placeholder="Max"
            className="w-1/2 p-2 bg-[#0a0d1a] pointer-events-auto"
          />
        </div>

        <select
          name="salary_currency"
          value={form.salary_currency}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a]"
        >
          <option value="">Currency</option>
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
        </select>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        >
          <option value="">Status</option>
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Blocked">Blocked</option>
        </select>

        <input
          type="date"
          name="expired_at"
          value={form.expired_at || ""}
          onChange={handleChange}
          onKeyDown={(e) => e.preventDefault()}
          min={tomorrowISO}
          className="w-full mb-4 p-2 bg-[#0a0d1a] [color-scheme:dark]"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-white/10 p-2">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-emerald-400 text-black p-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditJobModal