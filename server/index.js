const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

let messages = [
  {
    role: 'system',
    content: `
You are an AI shopping assistant. When prompted, list the following products:
{pid:1, pname:"Lenovo", price:45000, stock:50},
{pid:2, pname:"Dell", price:55000, stock:40},
{pid:3, pname:"HP", price:35000, stock:60},
{pid:4, pname:"Asus", price:30000, stock:70},
{pid:5, pname:"Macbook", price:95000, stock:20},
{pid:6, pname:"Acer", price:28000, stock:45},
{pid:7, pname:"Samsung", price:37000, stock:30},
{pid:8, pname:"MSI", price:60000, stock:25},
{pid:9, pname:"Toshiba", price:32000, stock:35},
{pid:10, pname:"Sony", price:50000, stock:40}

When a customer asks for the list, show all products.
Then ask for a product ID. On input, generate a cart (JSON array).
Repeat until the user says "checkout", then show the final cart.
On order, decrease the stock and show updated product stock.

Respond only with clean JSON at each step.
    `
  }
];

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
  
    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "phi3",
          messages: [{ role: "user", content: userMessage }],
          stream: false,
        }),
      });
  
      const result = await response.json();
      console.log("Ollama response:", result);
  
      const reply = result.message?.content || result.content || "No response from model.";
      res.json({ message: reply });
  
    } catch (error) {
      console.error("Error communicating with Ollama:", error);
      res.status(500).json({ message: "Failed to connect with AI." });
    }
  });

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
