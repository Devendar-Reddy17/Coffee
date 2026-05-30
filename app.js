(function () {
  const collectionName = "coffeeResponses";
  const hasFirebase = typeof firebase !== "undefined";
  const isConfigured = typeof firebaseConfig !== "undefined" && !firebaseConfig.apiKey.includes("PASTE_");
  const app = hasFirebase && isConfigured
    ? (firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig))
    : null;
  const db = app ? firebase.firestore() : null;

  const $ = (selector) => document.querySelector(selector);
  const landingView = $("#landingView");
  const yesForm = $("#yesForm");
  const noView = $("#noView");
  const thanksView = $("#thanksView");
  const formError = $("#formError");
  const selectedDate = $("#selectedDate");
  const coffeeShop = $("#coffeeShop");
  const smallDrive = $("#smallDrive");
  const yesButton = $("#yesButton");
  const noButton = $("#noButton");

  const showView = (view) => {
    [landingView, yesForm, noView, thanksView].forEach((item) => {
      if (item) item.classList.toggle("is-active", item === view);
    });
  };

  const setTomorrowAsMinimumDate = () => {
    if (!selectedDate) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    selectedDate.min = tomorrow.toISOString().split("T")[0];
  };

  const saveResponse = async (response) => {
    if (!db) {
      throw new Error("Firebase is not configured yet. Paste your Firebase config into firebase-config.js.");
    }

    await db.collection(collectionName).add({
      answer: response.answer,
      selectedDate: response.selectedDate || "",
      coffeeShop: response.coffeeShop || "",
      smallDrive: Boolean(response.smallDrive),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  };

  const setBusy = (button, busy) => {
    if (!button) return;
    button.disabled = busy;
    button.textContent = busy ? "Sending..." : "Send";
  };

  const startConfetti = () => {
    const canvas = $("#confettiCanvas");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const colors = ["#5a3826", "#b98252", "#c7776a", "#65745c", "#fffaf3"];
    const pieces = Array.from({ length: 110 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight,
      size: 5 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 2 + Math.random() * 4,
      drift: -1.5 + Math.random() * 3,
      rotation: Math.random() * 360
    }));
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((piece) => {
        piece.y += piece.speed;
        piece.x += piece.drift;
        piece.rotation += 7;
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate((piece.rotation * Math.PI) / 180);
        context.fillStyle = piece.color;
        context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
        context.restore();
      });

      frame += 1;
      if (frame < 150) {
        requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    resize();
    draw();
  };

  const initInvitation = () => {
    if (!landingView) return;
    setTomorrowAsMinimumDate();

    yesButton.addEventListener("click", () => showView(yesForm));

    noButton.addEventListener("click", async () => {
      noButton.disabled = true;
      try {
        await saveResponse({ answer: "no" });
      } catch (error) {
        console.warn(error);
      } finally {
        showView(noView);
      }
    });

    yesForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      formError.textContent = "";

      if (!yesForm.checkValidity()) {
        yesForm.reportValidity();
        return;
      }

      setBusy($("#submitButton"), true);
      try {
        await saveResponse({
          answer: "yes",
          selectedDate: selectedDate.value,
          coffeeShop: coffeeShop.value.trim(),
          smallDrive: smallDrive.checked
        });
        showView(thanksView);
        startConfetti();
      } catch (error) {
        formError.textContent = error.message;
      } finally {
        setBusy($("#submitButton"), false);
      }
    });
  };

  const renderAdmin = async () => {
    const list = $("#responsesList");
    if (!list) return;

    const enteredPasscode = window.prompt("Admin passcode");
    if (enteredPasscode !== ADMIN_PASSCODE) {
      list.innerHTML = "<p class=\"note\">Access hidden.</p>";
      return;
    }

    if (!db) {
      list.innerHTML = "<p class=\"note\">Firebase is not configured yet.</p>";
      return;
    }

    list.innerHTML = "<p class=\"note\">Loading responses...</p>";

    try {
      const snapshot = await db.collection(collectionName).orderBy("timestamp", "desc").get();
      if (snapshot.empty) {
        list.innerHTML = "<p class=\"note\">No responses yet.</p>";
        return;
      }

      list.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp && data.timestamp.toDate
          ? data.timestamp.toDate().toLocaleString()
          : "Pending timestamp";
        const card = document.createElement("article");
        card.className = "response-card";
        card.innerHTML = `
          <div>
            <strong>${escapeHtml(data.answer || "Unknown").toUpperCase()}</strong>
            <p>Date: ${escapeHtml(data.selectedDate || "Not selected")}</p>
            <p>Coffee shop: ${escapeHtml(data.coffeeShop || "Not suggested")}</p>
            <p>Small drive: ${data.smallDrive ? "Yes" : "No"}</p>
          </div>
          <p>${escapeHtml(timestamp)}</p>
        `;
        list.appendChild(card);
      });
    } catch (error) {
      list.innerHTML = `<p class="note">${escapeHtml(error.message)}</p>`;
    }
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[character]));

  initInvitation();
  renderAdmin();
}());
