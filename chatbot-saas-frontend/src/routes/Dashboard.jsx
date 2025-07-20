import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { sendMessageToChatbot } from "../api"; // ✅ IMPORT debe estar arriba

const Dashboard = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      const reply = await sendMessageToChatbot(
        [{ role: "user", content: question }],
        "Responde con claridad usando solo lo que se te pide."
      );
      setResponse(reply);
    } catch (error) {
      console.error("Error consultando al chatbot:", error);
      setResponse("Ocurrió un error al obtener la respuesta.");
    }

    setQuestion("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenido, {session?.user?.email}
          </h1>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Escribe tu pregunta:</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            placeholder="Ej. ¿Cuál es la capital de Francia?"
          />
        </div>

        <button
          onClick={handleAsk}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Preguntar
        </button>

        {response && (
          <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded text-blue-900">
            <strong>Respuesta:</strong> {response}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
