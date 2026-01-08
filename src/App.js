// App.jsx
import { useState, useEffect } from "react";
import AuthTest from "./AuthTest";
import { auth } from "./firebase";
import StudentDashboard from "./pages/studentdashboard";
import TeacherDashboard from "./pages/teacherdashboard"; // 👈 import
import Chat from "./Chat";
import { getRoleFromEmail } from "./pages/roleUtils";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(true);

  const [role, setRole] = useState("unknown"); // student / teacher

  // selected group for chat (default CSE 3A Group)
  const [activeGroup, setActiveGroup] = useState({
    id: "chat-7077a",
    name: "CSE 3A Group",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const detectedRole = getRoleFromEmail(currentUser.email || "");
        setRole(detectedRole);
        setShowAuth(false);
        console.log("Detected role:", detectedRole, "for", currentUser.email);
      } else {
        setRole("unknown");
        setShowAuth(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setShowAuth(true);
    setUser(null);
    setRole("unknown");
    setActiveGroup({
      id: "chat-7077a",
      name: "CSE 3A Group",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Loading MIST Portal...
      </div>
    );
  }

  if (user && !showAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        {/* Top bar */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "white",
            padding: "15px 20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#FF4E50",
                fontSize: "1.4em",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              🎓 MIST Portal
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "0.9em",
                color: "#666",
                fontWeight: "500",
              }}
            >
              Welcome{" "}
              {user.displayName || user.email?.split("@")[0] || "User"} (
              {role})
              !
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background:
                "linear-gradient(135deg, #FF4E50 0%, #F9D423 100%)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 4px 15px rgba(255, 78, 80, 0.4)",
              transition: "0.3s",
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Main area: left = dashboard, right = chat */}
        <div
          style={{
            paddingTop: "120px",
            paddingBottom: "20px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.6fr)",
            gap: "20px",
            alignItems: "flex-start",
          }}
        >
          {/* LEFT: dashboard based on role */}
          {role === "teacher" ? (
            <TeacherDashboard
              user={user}
              activeGroup={activeGroup}
              setActiveGroup={setActiveGroup}
            />
          ) : (
            <StudentDashboard
              user={user}
              activeGroup={activeGroup}
              setActiveGroup={setActiveGroup}
            />
          )}

          {/* RIGHT: chat (always visible) */}
          <div
            style={{
              marginRight: "20px",
            }}
          >
            <Chat
              chatId={activeGroup.id}
              userId={user.uid}
              userName={
                user.displayName ||
                user.email?.split("@")[0] ||
                "Student"
              }
              groupName={activeGroup.name}
            />
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
      }}
    >
      <AuthTest />
    </div>
  );
}

export default App;
