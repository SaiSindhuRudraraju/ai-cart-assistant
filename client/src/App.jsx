import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([]);

  const handleSend = async () => {
    if (!query.trim()) return;
  
    const userMessage = query.trim();
    setChat(prevChat => [...prevChat, { sender: 'You', text: userMessage }]);
    setQuery('');
  
    try {
      const res = await axios.post('http://localhost:5000/chat', { message: userMessage });
      const aiMessage = res.data;
  
      if (aiMessage.output) {  // <-- check for output key
        setChat(prevChat => [...prevChat, { sender: 'AI', text: aiMessage.output }]);
      } else if (aiMessage.observation) {  // <-- check if observation exists
        const formattedJson = JSON.stringify(aiMessage.observation, null, 2);
        setChat(prevChat => [...prevChat, { sender: 'AI', text: formattedJson }]);
      } else {
        setChat(prevChat => [...prevChat, { sender: 'AI', text: 'Action processed.' }]);
      }
    } catch (err) {
      setChat(prevChat => [...prevChat, { sender: 'AI', text: 'Error: Could not connect to server.' }]);
    }
  };  

  const renderMessage = (msg, index) => {
    if (Array.isArray(msg.text)) {
      return (
        <div key={index}>
          <strong>{msg.sender}:</strong>
          <table border="1" cellPadding="5" style={{ marginTop: '5px', width: '100%' }}>
            <thead>
              <tr>
                {Object.keys(msg.text[0]).map((key) => (
                  <th key={key}>{key.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {msg.text.map((item, i) => (
                <tr key={i}>
                  {Object.values(item).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div key={index} style={{ marginBottom: '10px' }}>
        <strong>{msg.sender}:</strong>{' '}
        {msg.text.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>🛒 Shopping Assistant</h2>
      <div style={{ minHeight: '300px', border: '1px solid #ccc', padding: '10px', overflowY: 'auto' }}>
        {chat.map((msg, idx) => renderMessage(msg, idx))}
      </div>
      <div style={{ marginTop: '15px', display: 'flex' }}>
        <input
          type="text"
          value={query}
          placeholder="Ask or type product ID..."
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, padding: '10px' }}
        />
        <button onClick={handleSend} style={{ marginLeft: '10px', padding: '10px 20px' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;