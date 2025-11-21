import { useEffect, useState } from "react";
import axios from "axios";

interface VolunteerHours {
  id: number;
  abbreviation: string;
  name: string;
  description: string;
  status: string;
}

export default function Dashboard() {
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHours[]>([]);
  const [form, setForm] = useState({ abbreviation: "", name: "", description: "", system: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fullname = typeof window !== "undefined" ? localStorage.getItem("fullname") : null;

  const api = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
  });

  // Fetch volunteer hours
  const fetchVolunteerHours = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departments");
      setVolunteerHours(res.data.data || []);
    } catch (error) {
      showMessage("Error loading volunteer hours.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerHours();
  }, []);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!form.abbreviation || !form.name || !form.description || !form.system) {
      showMessage("Please fill in all fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      // Map system field to status for backend compatibility
      const payload = {
        abbreviation: form.abbreviation,
        name: form.name,
        description: form.description,
        status: form.system,
      };
      
      if (editingId !== null && editingId > 0) {
        await api.put(`/departments/${editingId}`, payload);
        showMessage("Volunteer hours updated successfully!", "success");
      } else {
        await api.post("/departments", payload);
        showMessage("Volunteer hours added successfully!", "success");
      }

      setForm({ abbreviation: "", name: "", description: "", system: "" });
      setEditingId(null);
      fetchVolunteerHours();
    } catch (error: any) {
      showMessage(error.response?.data?.message || "Error submitting volunteer hours.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry: VolunteerHours) => {
    setForm({
      abbreviation: entry.abbreviation,
      name: entry.name,
      description: entry.description,
      system: entry.status,
    });
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setForm({ abbreviation: "", name: "", description: "", system: "" });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this volunteer hours entry? This action cannot be undone.")) {
      try {
        await api.delete(`/departments/${id}`);
        showMessage("Volunteer hours deleted successfully!", "success");
        fetchVolunteerHours();
      } catch (error: any) {
        showMessage(error.response?.data?.message || "Error deleting volunteer hours.", "error");
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("fullname");
      localStorage.removeItem("role");
      window.location.href = "/";
    }
  };

  return (
    <div className="dashboard-page">
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <div className="brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <span className="brand-text">VolunteerLog</span>
          </div>
          
          <div className="navbar-menu">
            <div className="nav-menu-item active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="9" y1="9" x2="21" y2="9"></line>
              </svg>
              <span>Hours Log</span>
            </div>
          </div>

          <div className="navbar-user">
            <div className="user-profile">
              <div className="user-avatar-small">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="user-details">
                <span className="user-name-small">{fullname || "User"}</span>
                <span className="user-role-small">Admin</span>
              </div>
            </div>
            <button className="navbar-logout-btn" onClick={handleLogout} title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Page Header */}
        <div className="page-header-section">
          <div className="page-header-content">
            <div>
              <h1 className="page-title">{editingId ? "Edit Hours Entry" : "Manage Volunteer Hours"}</h1>
              <p className="page-subtitle">Log and track volunteer hours efficiently</p>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="9" y1="9" x2="21" y2="9"></line>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Entries</span>
                  <span className="stat-value">{volunteerHours.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`dashboard-alert ${message.type}`}>
            <div className="alert-icon">
              {message.type === "success" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              )}
            </div>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="alert-close">×</button>
          </div>
        )}

        <div className="dashboard-content">
          {/* Form Section */}
          <section className="content-section">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">{editingId ? "Edit Hours Entry" : "Log New Volunteer Hours"}</h2>
                {editingId && (
                  <button className="cancel-btn" onClick={handleCancel}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancel
                  </button>
                )}
              </div>

              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="abbreviation">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Volunteer Name *
                    </label>
                    <input
                      id="abbreviation"
                      name="abbreviation"
                      type="text"
                      value={form.abbreviation}
                      onChange={handleChange}
                      placeholder="e.g., John Doe, Jane Smith"
                      maxLength={50}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                      Activity/Project *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g., Community Cleanup, Food Drive"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      Description *
                    </label>
                    <input
                      id="description"
                      name="description"
                      type="text"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the volunteer work performed"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="system">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                      Service Type *
                    </label>
                    <select
                      id="system"
                      name="system"
                      value={form.system}
                      onChange={handleChange}
                    >
                      <option value="">Select Service Type</option>
                      <option value="Community Service">Community Service</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Environmental">Environmental</option>
                      <option value="Social Services">Social Services</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="submit-btn" 
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="button-loading">
                      <span className="spinner"></span>
                      {editingId ? "Updating..." : "Logging..."}
                    </span>
                  ) : (
                    <>
                      {editingId ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                          Update Entry
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Log Hours
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Table Section */}
          <section className="content-section">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">All Volunteer Hours</h2>
                <span className="section-badge">{volunteerHours.length} {volunteerHours.length === 1 ? "entry" : "entries"}</span>
              </div>

              {loading ? (
                <div className="loading-state">
                  <span className="spinner"></span>
                  <p>Loading volunteer hours...</p>
                </div>
              ) : volunteerHours.length === 0 ? (
                <div className="empty-state">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <p>No volunteer hours found</p>
                  <span>Log your first volunteer hours to get started</span>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="departments-table">
                    <thead>
                      <tr>
                        <th>Volunteer</th>
                        <th>Activity/Project</th>
                        <th>Description</th>
                        <th>Service Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteerHours.map((entry) => (
                        <tr key={entry.id}>
                          <td>
                            <span className="abbreviation-badge">{entry.abbreviation}</span>
                          </td>
                          <td className="name-cell">{entry.name}</td>
                          <td className="description-cell">{entry.description}</td>
                          <td>
                            <span className={`status-badge status-${entry.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {entry.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-btn edit-btn" 
                                onClick={() => handleEdit(entry)}
                                title="Edit entry"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                              </button>
                              <button 
                                className="action-btn delete-btn" 
                                onClick={() => handleDelete(entry.id)}
                                title="Delete entry"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
