// src/pages/studentdashboard.jsx
import React, { useState } from "react";

function StudentDashboard({ user, activeGroup, setActiveGroup }) {
  const email = user && user.email ? user.email : "";
  const studentName =
    (user && user.displayName) ||
    (email ? email.split("@")[0] : "Student");

  // initial sample groups
  const [groups, setGroups] = useState([
    { id: "chat-7077a", name: "CSE 3A Group", mentorEmail: "mentor1@mist.ac.in" },
    { id: "chat-7077b", name: "Project Discussion", mentorEmail: "mentor2@mist.ac.in" },
  ]);

  // personal 1‑to‑1 chats with status: "pending" | "active"
  const [personalChats, setPersonalChats] = useState([]);

  // tabs: group chats / personal chats
  const [activeTab, setActiveTab] = useState("groups"); // "groups" | "personal"

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMentor, setGroupMentor] = useState("");
  const [groupMembers, setGroupMembers] = useState("");

  // 1‑to‑1 request popup
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [requestMentor, setRequestMentor] = useState("");
  const [requestReason, setRequestReason] = useState("");

  // create group
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

    setActiveGroup({ id: newGroup.id, name: newGroup.name });
  };

  // send 1‑to‑1 request
  const handleSendRequest = (e) => {
    e.preventDefault();
    alert("Send Request clicked"); // for debugging

    if (!requestMentor.trim() || !requestReason.trim()) {
      alert("Please fill mentor email and reason.");
      return;
    }

    const mentorEmail = requestMentor.trim();
    const studentEmail = email; // safe string
    const studentId = studentEmail ? studentEmail.split("@")[0] : "student";

    console.log("Student 1-to-1 request:", {
      studentId,
      studentEmail,
      mentorEmail,
      reason: requestReason.trim(),
    });

    // if email is empty, just create a local id
    const dmId = studentEmail
      ? `dm-${mentorEmail.toLowerCase()}-${studentEmail.toLowerCase()}`
      : `dm-${mentorEmail.toLowerCase()}-${Date.now()}`;

    // add/update this DM as pending
    setPersonalChats((prev) => {
      const existing = prev.find((p) => p.id === dmId);
      if (existing) {
        return prev.map((p) =>
          p.id === dmId ? { ...p, status: "pending" } : p
        );
      }
      return [
        ...prev,
        {
          id: dmId,
          name: `Chat with ${mentorEmail}`,
          status: "pending",
        },
      ];
    });

    setShowRequestPopup(false);
    setRequestMentor("");
    setRequestReason("");
    setActiveTab("personal");
    alert("Your 1‑to‑1 chat request has been sent. Chat will be enabled after teacher accepts.");
  };

  // in real app, call this when teacher accepts (from backend)
  const markChatActive = (dmId) => {
    setPersonalChats((prev) =>
      prev.map((p) =>
        p.id === dmId ? { ...p, status: "active" } : p
      )
    );
  };

  // student can open chat only if status is active
  const handleOpenPersonalChat = (chat) => {
    if (chat.status !== "active") {
      alert("Teacher has not accepted yet.");
      return;
    }
    setActiveGroup({ id: chat.id, name: chat.name });
  };

  return (
    <div
      style={{
        paddingLeft: "20px",
        paddingRight: "10px",
      }}
    >
      {/* Profile + request button */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "16px 18px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 8px" }}>Student Dashboard</h2>
          <p style={{ margin: "3px 0" }}>
            <strong>Name:</strong> {studentName}
          </p>
          <p style={{ margin: "3px 0" }}>
            <strong>Email:</strong> {email || "no-email" }
          </p>
        </div>

        <button
          onClick={() => setShowRequestPopup(true)}
          style={{
            padding: "6px 10px",
            borderRadius: "999px",
            border: "none",
            background:
              "linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)",
            color: "white",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          ✨ Request 1‑to‑1 Chat
        </button>
      </div>

      {/* 1‑to‑1 Request popup */}
      {showRequestPopup && (
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
          onClick={() => setShowRequestPopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: "400px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              padding: "16px 18px",
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
              <h3 style={{ margin: 0 }}>Request 1‑to‑1 Mentoring</h3>
              <button
                onClick={() => setShowRequestPopup(false)}
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

            <form
              onSubmit={handleSendRequest}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              <input
                type="email"
                placeholder="Mentor email (e.g., mentor1@mist.ac.in)"
                value={requestMentor}
                onChange={(e) => setRequestMentor(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                }}
              />
              <textarea
                placeholder="Reason for 1‑to‑1 chat (e.g., project doubts, mentoring)"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                rows={3}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "6px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowRequestPopup(false)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    background: "white",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
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
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs: Group Chats / Personal Chats */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "10px 12px 0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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

        <div
          style={{
            padding: "6px 6px 12px",
          }}
        >
          {activeTab === "groups" ? (
            <>
              {/* header row: title + create button */}
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

              {/* Create group form */}
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
            </>
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
                  No personal chats yet. Send a 1‑to‑1 request to start one.
                </li>
              )}
              {personalChats.map((p) => {
                const isPending = p.status === "pending";
                const isSelected = activeGroup?.id === p.id;

                return (
                  <li
                    key={p.id}
                    onClick={() => handleOpenPersonalChat(p)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      marginBottom: "6px",
                      cursor: isPending ? "not-allowed" : "pointer",
                      opacity: isPending ? 0.6 : 1,
                      background: isSelected ? "#eef5ff" : "#f7f7f7",
                      border:
                        isSelected
                          ? "1px solid #5B86E5"
                          : "1px solid transparent",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: isPending ? "#b45309" : "#059669",
                      }}
                    >
                      {isPending
                        ? "Waiting for teacher to accept"
                        : "Active – click to open chat"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
