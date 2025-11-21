import { useEffect, useState } from "react";
import axios from "axios";

interface VolunteerHours {
  id: number;
  abbreviation: string;
  name: string;
  description: string;
  status: string;
}

export default function GuestDashboard() {
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHours[]>([]);
  const [loading, setLoading] = useState(false);
  const fullname = typeof window !== "undefined" ? localStorage.getItem("fullname") : null;
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const api = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
  });

  // Fetch volunteer hours (read-only for guests)
  const fetchVolunteerHours = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departments");
      setVolunteerHours(res.data.data || []);
    } catch (error) {
      console.error("Error loading volunteer hours:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerHours();
  }, []);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const getServiceTypeCount = (type: string) => {
    return volunteerHours.filter(h => h.status.toLowerCase().includes(type.toLowerCase())).length;
  };

  return (
    <div className="guest-dashboard-new">
      {/* Header Section */}
      <header className="guest-header-new">
        <div className="header-top-new">
          <div className="header-left-new">
            <div className="logo-circle-new">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div>
              <h1 className="header-title-new">VolunteerLog</h1>
              <p className="header-subtitle-new">View Volunteer Hours</p>
            </div>
          </div>
          <button className="logout-button-new" onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>

        <div className="user-banner-new">
          <div className="user-avatar-large-new">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="user-welcome-new">
            <h2>Welcome, {fullname || "Guest"}!</h2>
            <p>{role === "admin" ? "Administrator" : "Guest Viewer"} - View-only access</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-section-new">
        <div className="stat-box-new primary">
          <div className="stat-icon-new">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
          </div>
          <div className="stat-content-new">
            <div className="stat-value-new">{volunteerHours.length}</div>
            <div className="stat-label-new">Total Entries</div>
          </div>
        </div>

        <div className="stat-box-new">
          <div className="stat-icon-new">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content-new">
            <div className="stat-value-new">{getServiceTypeCount("Community")}</div>
            <div className="stat-label-new">Community Service</div>
          </div>
        </div>

        <div className="stat-box-new">
          <div className="stat-icon-new">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
          <div className="stat-content-new">
            <div className="stat-value-new">{getServiceTypeCount("Education")}</div>
            <div className="stat-label-new">Education</div>
          </div>
        </div>

        <div className="stat-box-new">
          <div className="stat-icon-new">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-content-new">
            <div className="stat-value-new">{getServiceTypeCount("Healthcare")}</div>
            <div className="stat-label-new">Healthcare</div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <main className="guest-content-new">
        <div className="section-header-new">
          <h2>All Volunteer Hours</h2>
          <span className="entry-count-new">{volunteerHours.length} {volunteerHours.length === 1 ? "entry" : "entries"}</span>
        </div>

        {loading ? (
          <div className="loading-container-new">
            <div className="spinner-large-new"></div>
            <p>Loading volunteer hours...</p>
          </div>
        ) : volunteerHours.length === 0 ? (
          <div className="empty-container-new">
            <div className="empty-icon-new">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3>No volunteer hours found</h3>
            <p>There are currently no volunteer hours available to view</p>
          </div>
        ) : (
          <div className="cards-grid-new">
            {volunteerHours.map((entry) => (
              <div key={entry.id} className="entry-card-new">
                <div className="card-header-entry-new">
                  <div className="volunteer-badge-new">{entry.abbreviation}</div>
                  <span className={`service-tag-new tag-${entry.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {entry.status}
                  </span>
                </div>
                <div className="card-body-entry-new">
                  <h3 className="activity-title-new">{entry.name}</h3>
                  <p className="activity-desc-new">{entry.description}</p>
                </div>
                <div className="card-footer-entry-new">
                  <div className="entry-meta-new">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Volunteer Entry</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
