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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className={`dashboard-layout-new ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className={`sidebar-new ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header-new">
          <div className="sidebar-logo-new">
            <div className="logo-box-new">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            {sidebarOpen && <span className="sidebar-brand-new">VolunteerLog</span>}
          </div>
          <button className="sidebar-toggle-new" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarOpen ? (
                <polyline points="18 6 12 12 6 6"></polyline>
              ) : (
                <polyline points="6 9 12 15 18 9"></polyline>
              )}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav-new">
          <div className="nav-item-new active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="9" y1="9" x2="21" y2="9"></line>
            </svg>
            {sidebarOpen && <span>Hours Log</span>}
          </div>
        </nav>

        <div className="sidebar-footer-new">
          <div className="user-card-new">
            <div className="user-avatar-new">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            {sidebarOpen && (
              <div className="user-info-new">
                <div className="user-name-new">{fullname || "User"}</div>
                <div className="user-role-new">Admin</div>
              </div>
            )}
          </div>
          <button className="logout-btn-new" onClick={handleLogout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content-new">
        {/* Top Bar */}
        <header className="topbar-new">
          <div className="topbar-left-new">
            <h1 className="page-title-new">{editingId ? "Edit Entry" : "Volunteer Hours"}</h1>
            <p className="page-subtitle-new">Manage and track volunteer hours</p>
          </div>
          <div className="topbar-right-new">
            <div className="stat-badge-new">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
              <span>{volunteerHours.length} Entries</span>
            </div>
          </div>
        </header>

        {/* Alert */}
        {message && (
          <div className={`alert-new ${message.type}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {message.type === "success" ? (
                <polyline points="20 6 9 17 4 12"></polyline>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </>
              )}
            </svg>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}>×</button>
          </div>
        )}

        {/* Content */}
        <div className="content-area-new">
          {/* Form Card */}
          <div className="form-card-new">
            <div className="card-title-new">
              <h2>{editingId ? "Edit Hours Entry" : "New Hours Entry"}</h2>
              {editingId && (
                <button className="cancel-btn-new" onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </div>

            <div className="form-grid-new">
              <div className="input-group-new">
                <label>Volunteer Name *</label>
                <input
                  name="abbreviation"
                  type="text"
                  value={form.abbreviation}
                  onChange={handleChange}
                  placeholder="Enter volunteer name"
                />
              </div>

              <div className="input-group-new">
                <label>Activity/Project *</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter activity or project name"
                />
              </div>

              <div className="input-group-new full-new">
                <label>Description *</label>
                <input
                  name="description"
                  type="text"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the volunteer work"
                />
              </div>

              <div className="input-group-new">
                <label>Service Type *</label>
                <select
                  name="system"
                  value={form.system}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="Community Service">Community Service</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Social Services">Social Services</option>
                </select>
              </div>
            </div>

            <button 
              className="save-btn-new" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <span className="btn-spinner-new"></span>
              ) : (
                <>
                  {editingId ? "Update Entry" : "Log Hours"}
                </>
              )}
            </button>
          </div>

          {/* Table Card */}
          <div className="table-card-new">
            <div className="card-title-new">
              <h2>All Entries</h2>
              <span className="count-badge-new">{volunteerHours.length}</span>
            </div>

            {loading ? (
              <div className="loading-new">
                <span className="btn-spinner-new"></span>
                <p>Loading...</p>
              </div>
            ) : volunteerHours.length === 0 ? (
              <div className="empty-new">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <p>No entries yet</p>
                <span>Start logging volunteer hours</span>
              </div>
            ) : (
              <div className="table-container-new">
                <table className="data-table-new">
                  <thead>
                    <tr>
                      <th>Volunteer</th>
                      <th>Activity</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteerHours.map((entry) => (
                      <tr key={entry.id}>
                        <td><span className="tag-new">{entry.abbreviation}</span></td>
                        <td>{entry.name}</td>
                        <td className="desc-cell-new">{entry.description}</td>
                        <td>
                          <span className={`type-badge-new type-${entry.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-group-new">
                            <button className="icon-btn-new edit" onClick={() => handleEdit(entry)} title="Edit">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button className="icon-btn-new delete" onClick={() => handleDelete(entry.id)} title="Delete">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
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
        </div>
      </div>
    </div>
  );
}
