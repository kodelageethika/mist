import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

function AuthTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordPopup, setForgotPasswordPopup] = useState(false);
  const [signupPopup, setSignupPopup] = useState(false);

  const [otpEmail, setOtpEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Timeout helper
  const timeoutPromise = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
      )
    ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified && !user.displayName) {
        try {
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            name: null,
            photo: null,
            provider: "password",
            verifiedAt: new Date(),
            createdAt: new Date()
          }, { merge: true });
        } catch (error) {
          console.error("Error creating user doc:", error);
        }
      }
    });
    return unsubscribe;
  }, []);

  // 🔹 Login with timeout & better error handling
  const login = async () => {
    if (!email || !password) {
      showMessage("Please enter email and password", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 Attempting login for:", email);
      
      const result = await timeoutPromise(
        signInWithEmailAndPassword(auth, email, password),
        10000 // 10s timeout
      );
      
      const user = result.user;
      console.log("✅ Login success:", user.email);

      if (!user.emailVerified) {
        showMessage("🔐 Verify your email first!", "error");
        await auth.signOut();
        return;
      }

      if (rememberMe) localStorage.setItem("rememberedUser", user.uid);

      showMessage(`✅ Welcome back, ${user.email}`);
    } catch (e) {
      console.error("❌ Login error:", e);
      const errorMsg = e.code 
        ? `Login failed: ${e.code === 'auth/user-not-found' ? 'No account found' : 
           e.code === 'auth/wrong-password' ? 'Wrong password' : 
           e.message}`
        : `Login failed: ${e.message}`;
      showMessage(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Signup
  const signup = async () => {
    if (!signupEmail || !signupPassword) return showMessage("Enter email and password", "error");

    setSignupLoading(true);
    try {
      console.log("🔄 Creating account for:", signupEmail);
      
      const result = await timeoutPromise(
        createUserWithEmailAndPassword(auth, signupEmail, signupPassword),
        10000
      );
      
      const user = result.user;
      console.log("✅ Account created:", user.email);

      await sendEmailVerification(user);
      showMessage(`🎉 Signup successful! Verification email sent to ${user.email}. Check inbox and reload after verifying.`);

      setSignupPopup(false);
      setSignupEmail("");
      setSignupPassword("");
    } catch (e) {
      console.error("❌ Signup error:", e);
      showMessage(`⚠️ ${e.code ? e.code : e.message}`, "error");
    } finally {
      setSignupLoading(false);
    }
  };

  // 🔹 Forgot password
  const handleForgotPassword = async () => {
    if (!otpEmail) return showMessage("Enter email for password reset", "error");

    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, otpEmail);
      showMessage("📧 Password reset email sent! Check your inbox.");
      setForgotPasswordPopup(false);
      setOtpEmail("");
    } catch (e) {
      showMessage(`⚠️ ${e.message}`, "error");
    } finally {
      setForgotLoading(false);
    }
  };

  // 🔹 Google Sign-In with timeout
  const googleSignIn = async () => {
    setLoading(true);
    try {
      console.log("🔄 Starting Google sign-in...");
      
      const result = await timeoutPromise(
        signInWithPopup(auth, googleProvider),
        15000 // 15s for popup
      );
      
      const user = result.user;
      console.log("✅ Google login success:", user.email);

      // Create Firestore doc for Google users
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        provider: user.providerData[0].providerId,
        createdAt: new Date()
      });

      showMessage(`✅ Welcome ${user.displayName}`);
    } catch (e) {
      console.error("❌ Google sign-in error:", e);
      const errorMsg = e.code 
        ? `Google sign-in failed: ${e.code}`
        : `Google sign-in failed: ${e.message}`;
      showMessage(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Rest of JSX remains EXACTLY the same...
  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* ALL JSX IDENTICAL TO YOUR ORIGINAL - NO UI CHANGES */}
      <div style={{ width: "400px", padding: "40px 30px", borderRadius: "20px", backgroundColor: "white", boxShadow: "0 15px 40px rgba(0,0,0,0.2)", textAlign: "center", position: "relative" }}>
        <h1 style={{ color: "#FF4E50", marginBottom: "25px" }}>MIST Portal</h1>

        {message && (
          <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", padding: "12px 20px", borderRadius: "12px", fontWeight: "bold", backgroundColor: message.type === "success" ? "#D4EDDA" : "#F8D7DA", color: message.type === "success" ? "#155724" : "#721C24", border: message.type === "success" ? "1px solid #C3E6CB" : "1px solid #F5C6CB", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            {message.text}
          </div>
        )}

        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Email</label>
          <input placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "95%", padding: "12px", borderRadius: "12px", border: "1px solid #ccc", outline: "none", fontSize: "14px", marginLeft: "2.5%" }} />
        </div>

        <div style={{ marginBottom: "10px", textAlign: "left" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Password</label>
          <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "95%", padding: "12px", borderRadius: "12px", border: "1px solid #ccc", outline: "none", fontSize: "14px", marginLeft: "2.5%" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "14px" }}>
          <label><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember Me</label>
          <span style={{ color: "#FF4E50", cursor: "pointer", fontWeight: "600" }} onClick={() => setForgotPasswordPopup(true)}>Forgot Password?</span>
        </div>

        <button onClick={login} disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "none", marginBottom: "15px", fontWeight: "bold", fontSize: "16px", background: "linear-gradient(90deg, #6A11CB 0%, #2575FC 100%)", color: "white", cursor: "pointer", transition: "0.3s" }}>
          {loading ? "Processing..." : "Login"}
        </button>

        <div style={{ margin: "15px 0", fontWeight: "bold", color: "#888" }}>---------------- OR ----------------</div>

        <button onClick={googleSignIn} disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "none", fontWeight: "bold", fontSize: "16px", backgroundColor: "#DB4437", color: "white", cursor: "pointer", transition: "0.3s", marginBottom: "15px" }}>
          {loading ? "Processing..." : "Sign in with Google"}
        </button>

        <span style={{ color: "#FF4E50", cursor: "pointer", fontWeight: "600" }} onClick={() => setSignupPopup(true)}>Create an Account</span>

        {/* Signup Popup - IDENTICAL */}
        {signupPopup && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "350px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
              <h2 style={{ marginBottom: "20px", color: "#FF4E50" }}>Sign Up</h2>
              <input placeholder="Enter email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #ccc", outline: "none", marginBottom: "15px" }} />
              <input placeholder="Enter password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #ccc", outline: "none", marginBottom: "20px" }} />
              <button onClick={signup} disabled={signupLoading} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "none", background: "linear-gradient(90deg, #FF4E50 0%, #F9D423 100%)", color: "white", fontWeight: "bold", cursor: "pointer" }}>
                {signupLoading ? "Sending verification email..." : "Signup & Verify Email"}
              </button>
              <p style={{ marginTop: "15px", color: "#FF4E50", cursor: "pointer" }} onClick={() => setSignupPopup(false)}>Cancel</p>
            </div>
          </div>
        )}

        {/* Forgot Password Popup - IDENTICAL */}
        {forgotPasswordPopup && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "350px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
              <h2 style={{ marginBottom: "20px", color: "#FF4E50" }}>Reset Password</h2>
              <input placeholder="Enter your email" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #ccc", outline: "none", marginBottom: "20px" }} />
              <button onClick={handleForgotPassword} disabled={forgotLoading} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "none", background: "linear-gradient(90deg, #FF4E50 0%, #F9D423 100%)", color: "white", fontWeight: "bold", cursor: "pointer" }}>
                {forgotLoading ? "Sending reset email..." : "Send Reset Email"}
              </button>
              <p style={{ marginTop: "15px", color: "#FF4E50", cursor: "pointer" }} onClick={() => setForgotPasswordPopup(false)}>Cancel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthTest;
