// src/pages/studentdashboard.jsx
import React, { useState } from "react";

function StudentDashboard({ user, activeGroup, setActiveGroup }) {
  const studentName =
    user?.displayName || user?.email?.split("@")[0] || "Student";

  // initial sample groups
  const [groups, setGroups] = useState([
    { id: "chat-7077a", name: "CSE 3A Group", mentorEmail: "mentor1@mist.ac.in" },
    { id: "chat-7077b", name: "Project Discussion", mentorEmail: "mentor2@mist.ac.in" },
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMentor, setGroupMentor] = useState("");
  const [groupMembers, setGroupMembers] = useState("");

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const newId = "chat-" + Date.now(); // unique chatId for this group
    const newGroup = {
      id: newId,
      name: groupName.trim(),
      mentorEmail: groupMentor.trim() || "",
      memberEmails: groupMembers
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setGroups((prev) => [...prev, newGroup]);
    setGroupName("");
    setGroupMentor("");
    setGroupMembers("");
    setShowCreate(false);

    // switch to new group's chat immediately
    setActiveGroup({ id: newGroup.id, name: newGroup.name });
  };

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
        <h2 style={{ margin: "0 0 8px" }}>Student Dashboard</h2>
        <p style={{ margin: "3px 0" }}>
          <strong>Name:</strong> {studentName}
        </p>
        <p style={{ margin: "3px 0" }}>
          <strong>Email:</strong> {user?.email}
        </p>
      </div>

      {/* My Groups card */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "16px 18px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {/* header row: title + create button on right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0 }}>My Groups</h3>
          <button
            onClick={() => setShowCreate((prev) => !prev)}
            style={{
              padding: "4px 10px",
              borderRadius: "16px",
              border: "none",
              background:
                "linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)",
              color: "white",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {showCreate ? "Close" : "+ Create Group"}
          </button>
        </div>

        {/* Create group form (toggles open/close) */}
        {showCreate && (
          <form
            onSubmit={handleCreateGroup}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "12px",
              padding: "10px",
              borderRadius: "8px",
              background: "#f7f7f7",
            }}
          >
            <input
              type="text"
              placeholder="Group name (e.g., CSE 3A Project Group)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            />
            <input
              type="email"
              placeholder="Mentor email (optional)"
              value={groupMentor}
              onChange={(e) => setGroupMentor(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            />
            <input
              type="text"
              placeholder="Student emails (comma separated)"
              value={groupMembers}
              onChange={(e) => setGroupMembers(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              style={{
                alignSelf: "flex-start",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background:
                  "linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)",
                color: "white",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Save Group
            </button>
          </form>
        )}

        {/* Groups list */}
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
      </div>
    </div>
  );
}

export default StudentDashboard;
