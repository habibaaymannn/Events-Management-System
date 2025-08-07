import React from "react";
import { useState } from "react";

const mockEvents = [
  {
    id: 101,
    name: "Tech Conference",
    owner: "Alice",
    location: "Grand Hall",
    date: "2025-08-15 10:00",
    status: "Scheduled",
    approval: "Approved"
  },
  {
    id: 102,
    name: "Wedding",
    owner: "Bob",
    location: "Sunset Villa",
    date: "2025-07-20 17:00",
    status: "Completed",
    approval: "Approved"
  },
  {
    id: 103,
    name: "Music Festival",
    owner: "Charlie",
    location: "City Park",
    date: "2025-09-01 18:00",
    status: "Ongoing",
    approval: "Pending"
  }
];

const EventMonitoring = () => {
  const [events, setEvents] = useState(mockEvents);

  const handleCancel = (id) => {
    setEvents(events.map(e => e.id === id ? { ...e, status: "Cancelled" } : e));
  };

  const handleFlag = (id) => {
    setEvents(events.map(e => e.id === id ? { ...e, approval: "Flagged" } : e));
  };

  return (
    <div>
      <h3>Event Monitoring</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Owner</th>
            <th>Location</th>
            <th>Date/Time</th>
            <th>Status</th>
            <th>Approval</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.owner}</td>
              <td>{e.location}</td>
              <td>{e.date}</td>
              <td>{e.status}</td>
              <td>{e.approval}</td>
              <td>
                <button
                  onClick={() => handleCancel(e.id)}
                  disabled={e.status === "Cancelled" || e.status === "Completed"}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFlag(e.id)}
                  disabled={e.approval === "Flagged"}
                >
                  Flag
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventMonitoring;