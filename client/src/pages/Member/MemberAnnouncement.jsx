import React, { useEffect, useState } from "react";
import { fetchAnnouncements } from "../../services/announcementService";

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

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center fw-bold" style={{ clor: "#1a1e27" }}>
        <span className="me-2 text-dark"></span>Announcements
      </h2>
      <div className="row justify-content-center g-4">
        <div className="card shadow-sm rounded-3 border-0 h-100">
          <div className="card-header bg-secondary text-white fw-bold rounded-top-3">
            Recent Announcements
          </div>
          <div className="card-body p-0">
            {announcements.length > 0 ? (
              <ul
                className="list-group list-group-flush rounded-bottom-3"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
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
  );
};

export default Announcement;
