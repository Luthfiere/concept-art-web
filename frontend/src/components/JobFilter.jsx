const JobFilter = () => {

  return (
    <div className="px-10 py-6 flex gap-4">

      <select className="bg-[#1a1d2e] border border-yellow-500 px-4 py-2 rounded">
        <option>Roles</option>
      </select>

      <select className="bg-[#1a1d2e] border border-yellow-500 px-4 py-2 rounded">
        <option>Location</option>
      </select>

      <input
        placeholder="Search job..."
        className="bg-[#1a1d2e] border border-yellow-500 px-4 py-2 rounded w-96"
      />

    </div>
  );

};

export default JobFilter;