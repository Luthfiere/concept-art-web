import { useState } from "react";
import api from "../../services/api";
import { sanitizeFields } from "../../utils/sanitize";

const WORK_OPTION = ["On-site", "Hybrid", "Remote"];
const WORK_TYPE = ["Full-time", "Part-time", "Contract", "Casual"];
const CURRENCIES = ["AUD", "HKD", "IDR", "MYR", "NZD", "PHP", "SGD", "THB", "USD"];

const EMPTY_FORM = {
  title: "",
  description: "",
  job_location: "",
  work_option: "Hybrid",
  work_type: "Full-time",
  salary_min: "",
  salary_max: "",
  salary_currency: "IDR",
  expired_at: "",
};

const PostJobForm = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (banner) setBanner(null);
  };

  const submit = async (status) => {
    if (
      form.salary_min &&
      form.salary_max &&
      Number(form.salary_min) > Number(form.salary_max)
    ) {
      setBanner({
        type: "error",
        message: "Minimum salary cannot exceed maximum salary.",
      });
      return;
    }

    setSubmitting(true);
    setBanner(null);
    try {
      const clean = sanitizeFields(form, ["title", "description", "job_location"]);
      await api.post("/job-postings", { ...clean, status });
      setBanner({
        type: "success",
        message: status === "Draft" ? "Draft saved." : "Job published!",
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      setBanner({
        type: "error",
        message: err.response?.data?.message || "Failed to post job.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = (e) => {
    e.preventDefault();
    submit("Active");
  };

  const inputCls =
    "w-full bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition";
  const labelCls = "block text-xs font-medium text-gray-400 mb-1.5";
  const sectionHeaderCls =
    "text-xs font-semibold uppercase tracking-wider text-yellow-400/80 mb-4";

  return (
    <form
      onSubmit={handlePublish}
      className="bg-[#111427]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl space-y-6 sm:space-y-8"
    >
      {banner && (
        <div
          className={`rounded-lg px-4 py-3 text-sm border ${
            banner.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
              : "bg-red-500/10 border-red-500/30 text-red-200"
          }`}
        >
          {banner.message}
        </div>
      )}

      <section className="space-y-4">
        <h3 className={sectionHeaderCls}>Basics</h3>

        <div>
          <label className={labelCls}>
            Job title <span className="text-red-400">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Senior Concept Artist"
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            className={`${inputCls} resize-none`}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className={sectionHeaderCls}>Location & work style</h3>

        <div>
          <label className={labelCls}>Location</label>
          <input
            name="job_location"
            value={form.job_location}
            onChange={handleChange}
            placeholder="e.g. Jakarta, Indonesia"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Work option</label>
            <select
              name="work_option"
              value={form.work_option}
              onChange={handleChange}
              className={inputCls}
            >
              {WORK_OPTION.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Work type</label>
            <select
              name="work_type"
              value={form.work_type}
              onChange={handleChange}
              className={inputCls}
            >
              {WORK_TYPE.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className={sectionHeaderCls}>Compensation</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Min salary</label>
            <input
              type="number"
              name="salary_min"
              value={form.salary_min}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Max salary</label>
            <input
              type="number"
              name="salary_max"
              value={form.salary_max}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Currency</label>
            <select
              name="salary_currency"
              value={form.salary_currency}
              onChange={handleChange}
              className={inputCls}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className={sectionHeaderCls}>Publishing</h3>

        <div>
          <label className={labelCls}>Expires on</label>
          <input
            type="date"
            name="expired_at"
            value={form.expired_at}
            onChange={handleChange}
            className={inputCls}
          />
          <p className="text-[11px] text-gray-500 mt-1.5">
            Posting will automatically move to &quot;Expired&quot; after this date.
          </p>
        </div>
      </section>

      <div className="pt-4 border-t border-white/5">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/50 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-yellow-400/30 transition"
        >
          {submitting ? "Publishing…" : "Publish job"}
        </button>
      </div>
    </form>
  );
};

export default PostJobForm;
