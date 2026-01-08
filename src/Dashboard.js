import Chat from "./Chat";

function Dashboard() {
  const currentUserId = "student1"; // Replace with real user ID
  const projectChatId = "projectA_group"; // Unique per project

  return <Chat chatId={projectChatId} userId={currentUserId} />;
}
