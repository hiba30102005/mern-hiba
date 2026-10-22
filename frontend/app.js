const CONFIG = window.APP_CONFIG;
const BACKENDS = [CONFIG.PRIMARY_API_URL, CONFIG.SECONDARY_API_URL];

const form = document.getElementById("item-form");
const submitBtn = document.getElementById("submit-btn");
const refreshBtn = document.getElementById("refresh-btn");
const list = document.getElementById("items");
const emptyMsg = document.getElementById("empty");
const messageBox = document.getElementById("message");
const statusEl = document.getElementById("backend-status");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message " + type;
  messageBox.hidden = false;
}

function hideMessage() {
  messageBox.hidden = true;
}

// Requete avec delai maximal et bascule automatique :
// erreur reseau, delai depasse (AbortController) ou reponse non reussie (!response.ok)
async function apiFetch(path, options = {}) {
  const errors = [];

  for (const baseUrl of BACKENDS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    try {
      const response = await fetch(baseUrl + path, { ...options, signal: controller.signal });

      if (!response.ok) {
        let detail = "";
        try {
          const data = await response.json();
          detail = data.error || "";
        } catch (_) {
          /* corps non JSON */
        }
        throw new Error(`HTTP ${response.status}${detail ? " : " + detail : ""}`);
      }

      statusEl.textContent = "Backend utilisé : " + baseUrl;
      return await response.json();
    } catch (err) {
      const reason = err.name === "AbortError" ? "delai depasse" : err.message;
      console.warn(`Echec sur ${baseUrl} (${reason})`);
      errors.push({ baseUrl, reason });
    } finally {
      clearTimeout(timer);
    }
  }

  statusEl.textContent = "Backend : indisponible";
  const error = new Error("Aucun backend n'a repondu");
  error.details = errors;
  throw error;
}

function renderItems(items) {
  list.innerHTML = "";
  emptyMsg.hidden = items.length > 0;

  for (const item of items) {
    const li = document.createElement("li");

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = item.name;
    li.appendChild(title);

    if (item.description) {
      const desc = document.createElement("p");
      desc.className = "desc";
      desc.textContent = item.description;
      li.appendChild(desc);
    }
    list.appendChild(li);
  }
}

function friendlyError(err) {
  if (err.details) {
    const only4xx = err.details.every((d) => /^HTTP 4\d\d/.test(d.reason));
    if (only4xx) return "Requete refusee : " + err.details[0].reason;
    return "Impossible de joindre le serveur pour le moment. Verifiez votre connexion puis reessayez.";
  }
  return err.message;
}

async function loadItems() {
  try {
    const items = await apiFetch("/api/items");
    renderItems(items);
  } catch (err) {
    showMessage(friendlyError(err), "error");
  }
}

// Cle unique par soumission : si la requete est rejouee (bascule, nouvelle tentative),
// le serveur renvoie l'element deja cree au lieu d'en creer un second.
function newRequestId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const name = form.name.value.trim();
  const description = form.description.value.trim();

  if (!name) {
    showMessage("Le nom est obligatoire.", "error");
    return;
  }

  submitBtn.disabled = true;
  const requestId = newRequestId();

  try {
    await apiFetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": requestId },
      body: JSON.stringify({ name, description }),
    });
    form.reset();
    showMessage("Élément ajouté avec succès.", "success");
    await loadItems();
  } catch (err) {
    showMessage(friendlyError(err), "error");
  } finally {
    submitBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", () => {
  hideMessage();
  loadItems();
});

loadItems();