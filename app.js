const thread = document.querySelector("#thread");
const form = document.querySelector("#composer");
const promptBox = document.querySelector("#prompt");
const send = document.querySelector("#send");
const hint = document.querySelector("#hint");
let mode = "chat";
let messages = [];

const escape = (text) => text.replace(/[&<>\"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[char]);
function scrollDown() { thread.scrollTop = thread.scrollHeight; }
function addBubble(role, text) {
  thread.querySelector(".welcome")?.remove();
  const el = document.createElement("article");
  el.className = `bubble ${role}`;
  el.innerHTML = `<span class="label">${role === "user" ? "YOU" : "PIXEL PILOT"}</span><div>${escape(text).replace(/\n/g, "<br>")}</div>`;
  thread.append(el); scrollDown(); return el;
}
function setBusy(busy) { send.disabled = busy; promptBox.disabled = busy; send.textContent = busy ? "…" : "↑"; }

document.querySelectorAll(".mode").forEach(button => button.addEventListener("click", () => {
  mode = button.dataset.mode;
  document.querySelectorAll(".mode").forEach(item => item.classList.toggle("active", item === button));
  promptBox.placeholder = mode === "chat" ? "Message Pixel Pilot…" : "Describe an image to create…";
  hint.textContent = mode === "chat" ? "AI can make mistakes. Check important information." : "Try: “A friendly robot watering plants, cozy illustration.”";
  promptBox.focus();
}));

document.querySelector("#new-chat").addEventListener("click", () => { messages = []; thread.innerHTML = '<article class="welcome"><div class="orb">✦</div><h1>Fresh start.</h1><p>What would you like to explore?</p></article>'; });
promptBox.addEventListener("input", () => { promptBox.style.height = "auto"; promptBox.style.height = `${Math.min(promptBox.scrollHeight, 160)}px`; });
promptBox.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });

form.addEventListener("submit", async event => {
  event.preventDefault(); const text = promptBox.value.trim(); if (!text) return;
  addBubble("user", text); promptBox.value = ""; promptBox.style.height = "auto"; setBusy(true);
  try {
    if (mode === "image") {
      const placeholder = addBubble("assistant", "Creating your image…");
      const response = await fetch("/api/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: text }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      placeholder.innerHTML = `<span class="label">PIXEL PILOT</span><img class="generated-image" alt="Generated: ${escape(text)}" src="${data.image}"><a class="download" download="pixel-pilot-image.png" href="${data.image}">Download image ↗</a>`;
    } else {
      messages.push({ role: "user", content: text });
      const typing = addBubble("assistant", "Thinking…");
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      messages.push({ role: "assistant", content: data.text });
      typing.querySelector("div").innerHTML = escape(data.text).replace(/\n/g, "<br>");
    }
  } catch (error) { addBubble("assistant", `Sorry, ${error.message}`); }
  finally { setBusy(false); promptBox.focus(); scrollDown(); }
});
