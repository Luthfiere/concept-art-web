import { useEffect, useRef } from "react";

const EditJobModal = ({ form, setForm, onClose, onSubmit }) => {
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [form.description]);

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
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()} 
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-4 font-bold">Edit Job</h2>

        <label htmlFor="title" className="block mb-1 text-sm text-white/70">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <div>
          <label
            htmlFor="description"
            className="block mb-1 text-xs font-medium text-gray-400"
          >
            Description
          </label>
          <textarea
            ref={descriptionRef}
            id="description"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Enter description"
            rows={3}
            className="w-full p-2.5 rounded-lg bg-[#0a0d1a] border border-white/10 text-sm text-gray-200 outline-none focus:border-amber-400/50 transition-colors resize-none overflow-hidden min-h-[80px]"
          />
        </div>

        <label
          htmlFor="job_location"
          className="block mb-1 text-sm text-white/70"
        >
          Location
        </label>
        <input
          id="job_location"
          name="job_location"
          value={form.job_location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <label
          htmlFor="work_option"
          className="block mb-1 text-sm text-white/70"
        >
          Work Option
        </label>
        <select
          id="work_option"
          name="work_option"
          value={form.work_option}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a]"
        >
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>

        <label htmlFor="work_type" className="block mb-1 text-sm text-white/70">
          Work Type
        </label>
        <select
          id="work_type"
          name="work_type"
          value={form.work_type}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a]"
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Casual">Casual</option>
        </select>

        <label className="block mb-1 text-sm text-white/70">Salary Range</label>
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

        <label
          htmlFor="salary_currency"
          className="block mb-1 text-sm text-white/70"
        >
          Currency
        </label>
        <select
          id="salary_currency"
          name="salary_currency"
          value={form.salary_currency}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a]"
        >
          <option value="">Currency</option>
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
        </select>

        <label
          htmlFor="expired_at"
          className="block mb-1 text-sm text-white/70"
        >
          Expiration Date
        </label>
        <input
          id="expired_at"
          type="date"
          name="expired_at"
          value={form.expired_at || ""}
          onChange={handleChange}
          onKeyDown={(e) => e.preventDefault()}
          min={tomorrowISO}
          className="w-full mb-4 p-2 bg-[#0a0d1a] [color-scheme:dark]"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-white/10 p-2 cursor-pointer">
            Cancel
          </button>
          <button
          className="cursor-pointer"
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to save these changes?",
              );

              if (confirmed) {
                onSubmit();
              }
            }}
            className="flex-1 bg-amber-400 text-black p-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditJobModal;
