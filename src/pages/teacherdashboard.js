// src/pages/teacherdashboard.jsx
import React, { useState } from "react";

function TeacherDashboard({ user, activeGroup, setActiveGroup }) {
  const teacherName =
    user?.displayName || user?.email?.split("@")[0] || "Teacher";

  // group chats
  const [groups] = useState([
    { id: "chat-7077t", name: "CSE 3A – Mentoring", mentorEmail: user?.email },
    { id: "chat-7077p", name: "Project Review Group", mentorEmail: user?.email },
  ]);

  // pending 1‑to‑1 requests (later you can load from backend)
  const [requests, setRequests] = useState([
    {
      id: "req-22131A05XX",
      studentId: "22131A05XX",
      studentEmail: "22131A05XX@mist.ac.in",
      reason: "Wants 1‑to‑1 mentoring chat",
    },
    {
      id: "req-22131A05YY",
      studentId: "22131A05YY",
      studentEmail: "22131A05YY@mist.ac.in",
      reason: "Doubts on project work",
    },
  ]);

  // accepted personal (1‑to‑1) chats shown in Personal Chats tab
  const [personalChats, setPersonalChats] = useState([]);

  const [activeTab, setActiveTab] = useState("groups"); // "groups" | "personal"
  const [showRequests, setShowRequests] = useState(false);

  const pendingCount = requests.length;

  const handleAcceptRequest = (req) => {
    // create dm room id
    const dmId = `dm-${(user?.email || "teacher").toLowerCase()}-${req.studentEmail.toLowerCase()}`;

    // add to personal chats if not already there
    setPersonalChats((prev) => {
      const exists = prev.some((p) => p.id === dmId);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: dmId,
          name: `Chat with ${req.studentId}`,
        },
      ];
    });

    // remove from pending requests
    setRequests((prev) => prev.filter((r) => r.id !== req.id));

    // switch chat to this DM
    setActiveGroup({
      id: dmId,
      name: `Chat with ${req.studentId}`,
    });

    setShowRequests(false);
    setActiveTab("personal");
  };

  const handleDismissRequest = (req) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    if (requests.length <= 1) setShowRequests(false);
  };

  return (
    <div
      style={{
        paddingLeft: "20px",
        paddingRight: "10px",
      }}
    >
      {/* Profile + notification bell */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px" }}>Teacher Dashboard</h2>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>
            <strong>Name:</strong> {teacherName}
          </p>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>
            <strong>Email:</strong> {user?.email}
          </p>
        </div>

        {/* Notification bell on right edge */}
        <button
          onClick={() => setShowRequests(true)}
          style={{
            position: "relative",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            background: "#f3f4ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="View 1‑to‑1 chat requests"
        >
          <span style={{ fontSize: "18px", color: "#4b5563" }}>🔔</span>
          {pendingCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                minWidth: "17px",
                height: "17px",
                padding: "0 4px",
                borderRadius: "999px",
                background: "#EF4444",
                color: "white",
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Requests popup */}
      {showRequests && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={() => setShowRequests(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: "420px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              padding: "16px 18px",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>Student Requests</h3>
              <button
                onClick={() => setShowRequests(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {requests.length === 0 ? (
              <p style={{ margin: 0, fontSize: "14px" }}>
                No pending 1‑to‑1 requests.
              </p>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    padding: "8px 10px",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <strong>Student:</strong> {req.studentId}
                  </div>
                  <div>
                    <strong>Email:</strong> {req.studentEmail}
                  </div>
                  <div>
                    <strong>Reason:</strong> {req.reason}
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      gap: "8px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#10B981",
                        color: "white",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleAcceptRequest(req)}
                    >
                      Accept & Open Chat
                    </button>
                    <button
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        background: "white",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDismissRequest(req)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "10px 12px 0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <button
            onClick={() => setActiveTab("groups")}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              background:
                activeTab === "groups"
                  ? "linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)"
                  : "#f3f4f6",
              color: activeTab === "groups" ? "white" : "#374151",
            }}
          >
            Group Chats
          </button>
          <button
            onClick={() => setActiveTab("personal")}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              background:
                activeTab === "personal"
                  ? "linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)"
                  : "#f3f4f6",
              color: activeTab === "personal" ? "white" : "#374151",
            }}
          >
            Personal Chats
          </button>
        </div>

        {/* Content under tabs */}
        <div
          style={{
            padding: "6px 6px 12px",
          }}
        >
          {activeTab === "groups" ? (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              {groups.map((g) => (
                <li
                  key={g.id}
                  onClick={() => setActiveGroup({ id: g.id, name: g.name })}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    marginBottom: "6px",
                    cursor: "pointer",
                    background:
                      activeGroup?.id === g.id ? "#eef5ff" : "#f7f7f7",
                    border:
                      activeGroup?.id === g.id
                        ? "1px solid #5B86E5"
                        : "1px solid transparent",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{g.name}</span>
                  {g.mentorEmail && (
                    <span style={{ fontSize: "12px", color: "#555" }}>
                      Mentor: {g.mentorEmail}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              {personalChats.length === 0 && (
                <li
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    padding: "6px 4px",
                  }}
                >
                  No personal chats yet. Accept a request from the bell icon to
                  start one.
                </li>
              )}
              {personalChats.map((p) => (
                <li
                  key={p.id}
                  onClick={() => setActiveGroup({ id: p.id, name: p.name })}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    marginBottom: "6px",
                    cursor: "pointer",
                    background:
                      activeGroup?.id === p.id ? "#eef5ff" : "#f7f7f7",
                    border:
                      activeGroup?.id === p.id
                        ? "1px solid #5B86E5"
                        : "1px solid transparent",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
