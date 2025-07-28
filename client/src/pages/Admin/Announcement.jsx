import React, { useEffect, useState } from "react";
import {
  fetchAnnouncements,
  createAnnouncement,
} from "../../services/announcementService";

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAllAnnouncements = async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data.reverse()); // Most recent first
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    fetchAllAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !description) {
      setError("Both fields are required");
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user")); // Get current user
      await createAnnouncement({ title, description, userId: user?.id });
      setTitle("");
      setDescription("");
      await fetchAllAnnouncements(); // Refresh list
    } catch (err) {
      console.error("Failed to create announcement:", err);
      setError("Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📢 Announcements</h2>

      {/* Form to create announcement */}
      <form onSubmit={handleSubmit} className="mb-4">
        {error && <p className="text-danger">{error}</p>}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter announcement title"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Sending..." : "Send Announcement"}
        </button>
      </form>

      {/* Display announcements */}
      <div className="list-group">
        {announcements.length > 0 ? (
          announcements.map((item) => (
            <div key={item._id} className="list-group-item">
              <h5>{item.title}</h5>
              <p>{item.description}</p>
              <small className="text-muted">
                Posted on {new Date(item.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        ) : (
          <p>No announcements yet.</p>
        )}
      </div>
    </div>
  );
};

export default Announcement;
