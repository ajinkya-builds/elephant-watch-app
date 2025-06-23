import React, { useState } from 'react';

const ReportActivity = () => {
  // Define state for the component
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date());

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
  };

  return (
    <div>
      <h1>Report Activity</h1>
      <form onSubmit={handleSubmit}>
        {/* Activity Type Selection */}
        <div>
          <label>
            Activity Type:
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              required
            >
              <option value="">Select an activity</option>
              <option value="walking">Walking</option>
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
              {/* Add more activity types as needed */}
            </select>
          </label>
        </div>

        {/* Duration Input */}
        <div>
          <label>
            Duration (minutes):
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </label>
        </div>

        {/* Date Picker */}
        <div>
          <label>
            Date:
            <input
              type="date"
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
              required
            />
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button type="submit">Submit Report</button>
        </div>
      </form>
    </div>
  );
};

export default ReportActivity;