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

  // personal (1‑to‑1) chats
  const [personalChats] = useState([
    {
      id: `dm-${user?.email || "teacher"}-22131A05XX@mist.ac.in`,
      name: "Chat with 22131A05XX",
    },
    {
      id: `dm-${user?.email || "teacher"}-22131A05YY@mist.ac.in`,
      name: "Chat with 22131A05YY",
    },
  ]);

  const [activeTab, setActiveTab] = useState("groups"); // "groups" | "personal"

  return (
    <div
      style={{
        paddingLeft: "20px",
        paddingRight: "10px",
      }}
    >
      {/* Profile */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "16px 18px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: "0 0 8px" }}>Teacher Dashboard</h2>
        <p style={{ margin: "3px 0" }}>
          <strong>Name:</strong> {teacherName}
        </p>
        <p style={{ margin: "3px 0" }}>
          <strong>Email:</strong> {user?.email}
        </p>
      </div>

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
