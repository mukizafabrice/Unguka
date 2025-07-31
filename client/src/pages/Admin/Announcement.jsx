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
      setAnnouncements(data.reverse());
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements.");
    }
  };
  
  useEffect(() => {
    fetchAllAnnouncements();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError("");
    
    if (!title.trim() || !description.trim()) {
      setError("Both title and description are required.");
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
     
      await createAnnouncement({ title, description, userId: user?.id });

      setTitle("");
      setDescription("");

      await fetchAllAnnouncements();
    } catch (err) {
      console.error("Failed to create announcement:", err);

      setError("Failed to send announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center fw-bold" style={{ clor: "#1a1e27" }}>
        <span className="me-2"></span>Announcements
      </h2>
      <div className="row justify-content-center g-4">
        <div className="col-lg-6 col-md-6 col-12">
          <div className="card shadow-sm rounded-3 border-0 h-100">
            <div className="card-header bg-primary text-white fw-bold rounded-top-3">
              Create New Announcement
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}
                <div className="mb-3">
                  <label
                    htmlFor="announcementTitle"
                    className="form-label fw-semibold"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    id="announcementTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter announcement title"
                    aria-describedby="titleHelp"
                  />
                  <div id="titleHelp" className="form-text">
                    Keep the title concise and clear.
                  </div>
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="announcementDescription"
                    className="form-label fw-semibold"
                  >
                    Description
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    id="announcementDescription"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed description"
                    aria-describedby="descriptionHelp"
                  ></textarea>
                  <div id="descriptionHelp" className="form-text">
                    Provide all necessary details for the announcement.
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-dark w-100 rounded-pill py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Sending...
                    </>
                  ) : (
                    "Send Announcement"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* Column for Displaying announcements */}
        <div className="col-lg-6 col-md-6 col-12">
          {" "}
          {/* Takes 6 columns on large/medium, full width on small */}
          <div className="card shadow-sm rounded-3 border-0 h-100">
            {" "}
            {/* h-100 to make cards same height */}
            <div className="card-header bg-secondary text-white fw-bold rounded-top-3">
              Recent Announcements
            </div>
            <div className="card-body p-0">
              {" "}
              {/* No padding here, handled by list-group-item */}
              {announcements.length > 0 ? (
                <ul
                  className="list-group list-group-flush rounded-bottom-3"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  {" "}
                  {/* Added max-height and overflow-y for scrollbar */}
                  {announcements.map((item) => (
                    <li
                      key={item._id}
                      className="list-group-item d-flex flex-column align-items-start py-3 px-4"
                    >
                      <h5 className="mb-1 text-dark fw-bold">{item.title}</h5>
                      <p className="mb-2 text-muted">{item.description}</p>
                      <small className="text-info">
                        Posted on {new Date(item.createdAt).toLocaleString()}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-center text-muted">
                  No announcements yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
