let cart = [];

// Seed from the server-side session cart so items added earlier are not lost
// when the user returns to the menu and adds more (POST /cart replaces the cart).
function initCart(initial) {
  if (!Array.isArray(initial)) return;
  cart = initial
    .map((c) => ({ itemId: Number(c.itemId), qty: Number(c.qty) }))
    .filter((c) => Number.isInteger(c.itemId) && c.itemId > 0 && c.qty > 0);
  const counter = document.getElementById("cart-number-count");
  if (counter) counter.innerHTML = cart.reduce((sum, c) => sum + c.qty, 0);
  cart.forEach((c) => {
    const btn = document.getElementById("btn" + c.itemId);
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "Added";
    }
  });
}

function addToCart(item_id) {
  const existing = cart.find((c) => c.itemId === item_id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ itemId: item_id, qty: 1 });
  }
  const total = cart.reduce((sum, c) => sum + c.qty, 0);
  document.getElementById("cart-number-count").innerHTML = total;
  const name = "btn" + item_id;
  document.getElementById(name).disabled = true;
  document.getElementById(name).innerHTML = "Added";
}

function openMyCart() {
  const url = "/cart";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": document.querySelector('meta[name="csrf-token"]').content,
    },
    body: JSON.stringify({ cart }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to update cart: ${response.status}`);
    }
    window.location.href = "/cart";
  }).catch((error) => {
    console.error("Could not save cart before opening it.", error);
    window.alert("Could not open your cart. Please refresh and try again.");
  });
}
