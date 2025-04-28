const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

const SYSTEM_PROMPT = 
`
  You are an AI Assistant with START, PLAN, ACTION, OBSERVATION, and OUTPUT states.
  Strictly follow this structured format in your response:

  1. START: The user input message.
  2. PLAN: Describe the plan using available tools.
  3. ACTION: Call the appropriate function/tool with its inputs.
  4. OBSERVATION: The result or observation based on the action.
  5. OUTPUT: The final response based on the observations and the action taken.

  Only return JSON formatted responses.

  Available Tools:
  - function getAllProducts(): Fetches the complete list of available products.
  - function getProductDetails(productId: number): Fetches details of a specific product using its ID.
  - function addToCart(productId: number): Adds a product to the user’s cart if available.
  - function getCartDetails(): Fetches the current cart's details.
  - function checkoutCart(): Finalizes the cart, reduces stock, and provides the final order summary.

  Example Scenarios:

  START  
  {"type": "user", "user": "Show all products"}
  {"type": "plan", "plan": "I will fetch all available products using the getAllProducts function."}
  {"type": "action", "function": "getAllProducts", "input": {}}
  {"type": "observation", "observation": [{"pid":1, "pname":"Lenovo", "price":45000, "stock":50}, {"pid":2, "pname":"Dell", "price":55000, "stock":40}]}
  {"type": "output", "output": "Available products:\nLenovo - $45000 (Stock: 50)\nDell - $55000 (Stock: 40)\n\nEnter a product ID to add it to your cart."}

  START  
  {"type": "user", "user": "1"} 
  {"type": "plan", "plan": "I will check if product ID exists. If valid, add to cart; if invalid, notify the user as product ID invalid and ask to re-enter productID and keep the cart unchanged."} 
  {"type": "action", "function": "getProductDetails", "input": {"productId": 1}}
  {"type": "observation", "observation": "Found product 'Lenovo' with price $45000."}
  {"type": "action", "function": "addToCart", "input": {"productId": 1}}
  {"type": "output", "output": "Your cart:\nLenovo - $45000\n\nAdd another product (enter ID) or type 'checkout'?"}

  START  
  {"type": "user", "user": "100"}
  {"type": "plan", "plan": "I will check if product ID exists. If valid, add to cart; if invalid, notify the user and keep the cart unchanged."}
  {"type": "action", "function": "getProductDetails", "input": {"productId": 100}}  
  {"type": "observation", "observation": "No product found."}
  {"type": "output", "output": "Product ID 100 does not exist.\n\nYour cart remains unchanged.\n\nEnter a valid product ID or type 'checkout'."}

  User chooses to checkout
  START  
  {"type": "user", "user": "checkout"}
  {"type": "plan", "plan": "I will finalize the cart using checkoutCart function and reduce stock."}
  {"type": "action", "function": "checkoutCart", "input": {}} 
  {"type": "observation", "observation": "Order processed. Stock updated:\nLenovo - $45000 (Stock: 49)\nDell - $55000 (Stock: 39)"}
  {"type": "output", "output": "Checkout complete!\n\nYour final order:\nLenovo - $45000\nDell - $55000\n\nUpdated Inventory:\nLenovo - $45000 (Stock: 49)\nDell - $55000 (Stock: 39)"}
`
let messages = [
  {
    role: 'system',
    content: SYSTEM_PROMPT    
  }
];

let cart = []; //cart array
let products = [
  { "pid": 1, "pname": "Lenovo", "price": 45000, "stock": 50 },
  { "pid": 2, "pname": "Dell", "price": 55000, "stock": 40 },
  { "pid": 3, "pname": "HP", "price": 35000, "stock": 60 },
  { "pid": 4, "pname": "Asus", "price": 30000, "stock": 70 },
  { "pid": 5, "pname": "Macbook", "price": 95000, "stock": 20 },
  { "pid": 6, "pname": "Acer", "price": 28000, "stock": 45 },
  { "pid": 7, "pname": "Samsung", "price": 37000, "stock": 30 },
  { "pid": 8, "pname": "MSI", "price": 60000, "stock": 25 },
  { "pid": 9, "pname": "Toshiba", "price": 32000, "stock": 35 },
  { "pid": 10, "pname": "Sony", "price": 50000, "stock": 40 }
];

// Function to get all products 'Show all products'
function getAllProducts() {
  return products;
}

// Function to get details of a specific product 'to check if product is there or not'
function getProductDetails(productId) {
  return products.find(product => product.pid === productId);
}

// Function to add a product to the cart
function addToCart(productId) {
  const product = products.find(p => p.pid === productId);
  if (product && product.stock > 0) {
    cart.push(product);
    return product;
  }
  return null;
}

// Function to get cart details
function getCartDetails() {
  return cart;
}

// Function to checkout and update product stock 'have to update....'
/*function checkoutCart() {
  let total = 0;

  cart.forEach(item => {
    total += item.price;

    const product = products.find(p => p.pid === item.pid);
    if (product && product.stock > 0) {
      product.stock -= 1; // Reduce stock by 1
    }
  });

  cart = [];
  return { total, updatedProducts: products };
}*/

// Function to checkout and update product stock
function checkoutCart() {
  let total = 0;

  cart.forEach(item => {
    total += item.price;

    const product = products.find(p => p.pid === item.pid);
    if (product && product.stock > 0) {
      product.stock -= 1;
    }
  });

  const orderSummary = cart.map(item => ({
    pname: item.pname,
    price: item.price
  }));

  // Clear the cart after checkout
  cart = [];

  return {
    message: 'Order processed successfully.',
    orderSummary: orderSummary,
    updatedStock: products.map(p => ({
      pname: p.pname,
      price: p.price,
      stock: p.stock
    }))
  };
}


const tools = {
  "getAllProducts": getAllProducts,
  "getProductDetails": getProductDetails,
  "addToCart": addToCart,
  "getCartDetails": getCartDetails,
  "checkoutCart": checkoutCart
};

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  messages.push({ role: 'user', content: JSON.stringify({ type: 'user', user: userMessage }) });

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "phi3",
      messages: messages,
      stream: false
    })
  });

  const jsonResponse = await response.json();
  const result = jsonResponse.message.content;

  console.log(result);
  
  messages.push({ role: 'assistant', content: result });

  const call = JSON.parse(result);

  if (call.type === "action") {
    const fn = tools[call.function];
    if (!fn) {
      return res.status(400).json({ error: `Unknown function: ${call.function}` });
    }

    let observation = null;

    if (call.function === "getAllProducts") {
      observation = fn();
    } else if (call.function === "getProductDetails" || call.function === "addToCart") {
      const { productId } = call.input;
      observation = fn(productId);
    } else if (call.function === "getCartDetails" || call.function === "checkoutCart") {
      observation = fn();
    }

    const obs = { "type": "observation", "observation": observation };
    messages.push({ role: 'assistant', content: JSON.stringify(obs) });
  }

  if (call.type === "output") {
    return res.json({ output: call.output });
  } else {
    return res.json({ message: 'Action processed' });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});