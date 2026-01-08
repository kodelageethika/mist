// Chat.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

function Chat({
  chatId = "chat-7077a",
  userId,
  userName = "User",
  groupName = "Group Chat",
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [reactionTargetId, setReactionTargetId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // listen to messages for CURRENT chatId only
  useEffect(() => {
    if (!chatId) return;

    setMessages([]);

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          message: data.message || "",
          senderId: data.senderId,
          senderName: data.senderName,
          fileUrl: data.fileUrl || null,
          fileName: data.fileName || null,
          reactions: data.reactions || {},
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });
      setMessages(loadedMessages);
    });

    return unsubscribe;
  }, [chatId]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => setFilePreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(file.name);
      }
    }
  };

  const clearFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = useCallback(async () => {
    const trimmedText = text.trim();
    if ((!trimmedText && !filePreview) || !userId) return;

    const optimisticId = `mist-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        senderId: userId,
        senderName: userName,
        message: trimmedText || "📎 File shared",
        fileUrl: filePreview,
        fileName:
          typeof filePreview === "string" && filePreview.includes("data:")
            ? "image.jpg"
            : filePreview,
        reactions: {},
        timestamp: new Date(),
      }
    ]);

    setText("");
    clearFile();

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: userId,
        senderName: userName,
        message: trimmedText,
        fileUrl: filePreview,
        fileName:
          typeof filePreview === "string" && filePreview.includes("data:")
            ? "image.jpg"
            : filePreview,
        reactions: {},
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("❌ Save failed:", error);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setText(trimmedText);
    }
  }, [text, filePreview, userId, userName, chatId]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleReaction = async (messageId, emoji) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const current = msg.reactions || {};
    const users = current[emoji] || [];
    const hasReacted = users.includes(userId);

    const updatedReactions = {
      ...current,
      [emoji]: hasReacted
        ? users.filter((id) => id !== userId)
        : [...users, userId],
    };

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, reactions: updatedReactions } : m
      )
    );
    setReactionTargetId(null);

    try {
      const msgRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(msgRef, { reactions: updatedReactions });
    } catch (err) {
      console.error("Failed to update reactions:", err);
    }
  };

  const reactionEmojis = ["👍", "❤️", "😂", "🎉", "👎"];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",  // more width
        height: "75vh",     // more height
        margin: "0 auto",
        background: "linear-gradient(145deg, #f8faff 0%, #fdf2ff 100%)",
        borderRadius: "20px",
        boxShadow: "0 18px 36px rgba(147,51,234,0.18)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      {/* Header – compact */}
      <div
        style={{
          padding: "8px 14px",
          background: "linear-gradient(135deg, #8B5CF6 0%, #F59E0B 70%)",
          color: "white",
          textAlign: "center",
          boxShadow: "0 3px 10px rgba(139,92,246,0.3)"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1em",
            fontWeight: "650",
            textShadow: "0 1px 2px rgba(0,0,0,0.15)"
          }}
        >
          💬 {groupName}
        </h2>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 12px",
          background:
            "linear-gradient(180deg, #f8faff 0%, #fdf2ff 50%, #FFDEE9 100%)"
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#7c3aed",
              textAlign: "center",
              fontWeight: "500"
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>✨</div>
            <div style={{ fontSize: "16px", marginBottom: "6px" }}>
              MIST Magic Chat
            </div>
            <div style={{ fontSize: "13px", opacity: 0.9 }}>
              {userName} joined {groupName}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const reactions = m.reactions || {};
            const hasAnyReactions =
              Object.values(reactions).some((arr) => arr && arr.length > 0);

            return (
              <div
                key={m.id}
                onClick={() =>
                  setReactionTargetId(
                    reactionTargetId === m.id ? null : m.id
                  )
                }
                style={{
                  display: "flex",
                  justifyContent:
                    m.senderId === userId ? "flex-end" : "flex-start",
                  marginBottom: hasAnyReactions ? "10px" : "6px",
                  position: "relative"
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "6px 8px",
                    borderRadius: "14px",
                    background:
                      m.senderId === userId
                        ? "linear-gradient(135deg, #823ca4d6 0%, #ebceffff 100%)"
                        : "rgba(255,255,255,0.94)",
                    color: m.senderId === userId ? "white" : "#1f2937",
                    boxShadow:
                      m.senderId === userId
                        ? "0 2px 6px rgba(130,60,164,0.25)"
                        : "0 2px 6px rgba(0,0,0,0.05)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.7)"
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      marginBottom: "3px",
                      opacity: m.senderId === userId ? 0.95 : 1
                    }}
                  >
                    {m.senderName?.slice(0, 20) || "Student"}
                  </div>

                  {m.fileUrl && (
                    <div style={{ marginBottom: "4px" }}>
                      {m.fileUrl.startsWith("data:image/") ? (
                        <img
                          src={m.fileUrl}
                          alt="attachment"
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            marginBottom: "3px"
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            padding: "6px 8px",
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "7px",
                            fontSize: "11px",
                            color: "#666"
                          }}
                        >
                          📎 {m.fileName || "File"}
                        </div>
                      )}
                    </div>
                  )}

                  {m.message && (
                    <div
                      style={{
                        fontSize: "13px",
                        lineHeight: "1.3",
                        wordBreak: "break-word",
                        fontWeight: "500"
                      }}
                    >
                      {m.message}
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: "10px",
                      opacity: 0.85,
                      marginTop: "3px",
                      fontWeight: "600",
                      textAlign: m.senderId === userId ? "right" : "left"
                    }}
                  >
                    {m.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>

                {/* Reaction counts strip */}
                {hasAnyReactions && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-12px",
                      right: m.senderId === userId ? "4px" : "auto",
                      left: m.senderId !== userId ? "4px" : "auto",
                      display: "flex",
                      gap: "3px",
                      background: "rgba(255,255,255,0.95)",
                      borderRadius: "999px",
                      padding: "1px 4px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                      fontSize: "10px",
                      alignItems: "center"
                    }}
                  >
                    {Object.entries(reactions).map(([emoji, users]) => {
                      if (!users || users.length === 0) return null;
                      return (
                        <span
                          key={emoji}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "1px",
                            padding: "0 3px",
                            borderRadius: "999px",
                            background: "rgba(243,244,246,0.9)"
                          }}
                        >
                          {emoji} {users.length}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Reaction picker */}
                {reactionTargetId === m.id && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: hasAnyReactions ? "-38px" : "-24px",
                      right: m.senderId === userId ? "0" : "auto",
                      left: m.senderId === userId ? "auto" : "0",
                      background: "white",
                      borderRadius: "14px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      padding: "3px 6px",
                      display: "flex",
                      gap: "3px",
                      zIndex: 10
                    }}
                  >
                    {reactionEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReaction(m.id, emoji);
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "15px",
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "8px 12px",
          background: "rgba(255,255,255,0.9)",
          borderTop: "1px solid rgba(139,92,246,0.25)",
          backdropFilter: "blur(20px)",
          display: "flex",
          gap: "6px",
          alignItems: "center",
          minHeight: "56px"
        }}
      >
        {filePreview && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(139,92,246,0.1)",
              padding: "4px 8px",
              borderRadius: "16px",
              maxWidth: "130px",
              minWidth: "0",
              flexShrink: 1
            }}
          >
            {typeof filePreview === "string" &&
            filePreview.includes("data:image/") ? (
              <img
                src={filePreview}
                alt=""
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "5px",
                  objectFit: "cover"
                }}
              />
            ) : (
              <span style={{ fontSize: "16px" }}>📎</span>
            )}
            <span
              style={{
                fontSize: "11px",
                color: "#8B5CF6",
                fontWeight: "500",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {typeof filePreview === "string" &&
              filePreview.includes("data:image/")
                ? "Image"
                : filePreview?.slice(0, 10) + "..."}
            </span>
            <button
              onClick={clearFile}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                fontSize: "14px",
                cursor: "pointer",
                padding: "1px",
                flexShrink: 0
              }}
            >
              ×
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type message..."
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "2px solid rgba(139,92,246,0.2)",
            borderRadius: "22px",
            outline: "none",
            fontSize: "14px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            fontWeight: "500",
            transition: "all 0.3s ease"
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#8B5CF6";
            e.target.style.boxShadow = "0 0 0 2px rgba(139,92,246,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(139,92,246,0.2)";
            e.target.style.boxShadow = "none";
          }}
        />

        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #bfb6c8ff 0%, #8f0ddaff 100%)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "900",
              boxShadow: "0 5px 14px rgba(139,92,246,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
            title="📎 Attach file/image"
          >
            📎
          </button>

          <button
            onClick={sendMessage}
            disabled={!text.trim() && !filePreview}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #8B5CF6 0%, #f59f0bb3 100%)",
              color: "white",
              border: "none",
              cursor:
                text.trim() || filePreview ? "pointer" : "not-allowed",
              fontSize: "15px",
              fontWeight: "bold",
              boxShadow: "0 5px 16px rgba(139,92,246,0.4)",
              opacity: text.trim() || filePreview ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
