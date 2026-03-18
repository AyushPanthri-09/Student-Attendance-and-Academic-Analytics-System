export default function AnalyticsFilters({ filters, setFilters }) {

  const handleChange = (e) => {

    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });

  };

  return (

    <div className="grid grid-cols-4 gap-4">

      <select name="department" onChange={handleChange}>
        <option value="">Department</option>
        <option>CSE</option>
        <option>ECE</option>
        <option>ME</option>
      </select>

      <select name="course" onChange={handleChange}>
        <option value="">Course</option>
        <option>BTech</option>
        <option>MTech</option>
      </select>

      <select name="semester" onChange={handleChange}>
        <option value="">Semester</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
      </select>

      <select name="subject" onChange={handleChange}>
        <option value="">Subject</option>
        <option>Data Structures</option>
        <option>Operating Systems</option>
      </select>

    </div>

  );

}