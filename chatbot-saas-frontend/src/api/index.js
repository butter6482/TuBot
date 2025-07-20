const API_URL = "http://localhost:8000";

export const sendMessageToChatbot = async (messages, instructions) => {
  const response = await axios.post(`${API_URL}/chatbot/message`, {
    messages,
    instructions,
  });
  return response.data.reply;
};
