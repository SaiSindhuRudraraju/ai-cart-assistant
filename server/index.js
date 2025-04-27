const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

let messages = [
  {
    role: 'system',
    content:
      `
      You are a shopping assistant. Follow this structure strictly:

      Products List:
      [
        {"pid":1, "pname":"Lenovo", "price":45000, "stock":50},
        {"pid":2, "pname":"Dell", "price":55000, "stock":40},
        {"pid":3, "pname":"HP", "price":35000, "stock":60},
        {"pid":4, "pname":"Asus", "price":30000, "stock":70},
        {"pid":5, "pname":"Macbook", "price":95000, "stock":20},
        {"pid":6, "pname":"Acer", "price":28000, "stock":45},
        {"pid":7, "pname":"Samsung", "price":37000, "stock":30},
        {"pid":8, "pname":"MSI", "price":60000, "stock":25},
        {"pid":9, "pname":"Toshiba", "price":32000, "stock":35},
        {"pid":10, "pname":"Sony", "price":50000, "stock":40}
      ]

      Rules:

      - When asked "show all products", respond with all the products in product list in the format:
        Products:
          "name" - $"price" availability: "stock" items
        Then say: "Please enter a product ID to add it to your cart."

      - Maintain a session-level "cart" array.
      - Only reduce stock on "checkout".

      When a user enters a product ID (1–10):
      - Add product to the cart without reducing stock.
      - Show the current cart in this format:
        Cart:
        name - $price
      - Then say: "Add another product (enter ID) or type 'checkout'?"

      If an invalid ID is entered:
      - Say: "No Product found"
      - Show the cart, then prompt again.

      Om "Show cart":
        -Show the current cart in this format:
          Cart:
          Lenovo - $45000
          Dell - $55000
        - Then say: "Add another product (enter ID) or type 'checkout'?"
      On "checkout":
      - Confirm items in cart:
        Final Cart:
        Lenovo - $45000
        Dell - $55000
      - Then reduce stock of each product in cart by 1.
      - Then show updated inventory:
        Updated Inventory:
        Lenovo - $45000 (Stock: 49)
        Dell - $55000 (Stock: 39)
      - Do not use bullet points, code blocks, or promotional text.
      - Do not reset cart or mention shipping, payment, etc.
    `
  }
];

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  messages.push({ role: 'user', content: userMessage });

  try 
  {
    const response = await fetch("http://localhost:11434/api/chat", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
      {
        model: "phi3",
        messages: messages,
        stream: false,
      }),
    });

    const result = await response.json();
    console.log("Ollama response:", result);

    const reply = result.message?.content || result.content || "No response from model.";
    messages.push({ role: 'assistant', content: reply });
    console.log("Printing : user message: " + userMessage + " reply of ai ******: " + reply);
    res.json({ message: reply });

  } catch (error) {
    console.error("Error communicating with Ollama:", error);
    res.status(500).json({ message: "Failed to connect with AI." });
  }
});

app.listen(PORT, () => {
  console.log("Server listening on http://localhost:${PORT}");
});