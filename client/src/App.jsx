import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([]);

  const handleSend = async () => {
    const res = await axios.post('http://localhost:5000/chat', {
      message: query
    });
    console.log(res)
    setChat([...chat, { sender: 'You', text: query }, { sender: 'AI', text: res.data.message }]);
    setQuery('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2> AI Product Assistant</h2>
      <div style={{ marginBottom: 10 }}>
        {chat.map((msg, idx) => (
          <div key={idx} style={{ margin: '5px 0' }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: '70%' }}
      />
      <button onClick={handleSend} style={{ marginLeft: 10 }}>
        Send
      </button>
    </div>
  );
}

export default App;
