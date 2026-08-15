const API_BASE_URL = "http://localhost:5000";

const path = location.pathname.split("/").pop();

const p = JSON.parse(localStorage.getItem("profile") || '{"name":"Guest","email":"guest@example.com"}');

const meds = JSON.parse(localStorage.getItem("meds") || '["Metformin","Amlodipine","Paracetamol"]');

function esc(x) {
  return String(x).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

// =============================================================
// LOAD CURRENT USER PROFILE
// =============================================================

async function loadCurrentUserProfile() {

  const token =
    localStorage.getItem("token");

  // -----------------------------------------------------------
  // Authentication check
  // -----------------------------------------------------------

  if (!token) {
    location.href = "login.html";
    return;
  }

  try {

    const response =
      await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          method: "GET",

          headers: {
            "Authorization":
              `Bearer ${token}`
          }
        }
      );

    const data =
      await response.json();

    // ---------------------------------------------------------
    // Handle invalid / expired token
    // ---------------------------------------------------------

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      logout();
      return;
    }

    if (
      !response.ok ||
      data.success === false
    ) {
      throw new Error(
        data.message ||
        "Unable to load profile."
      );
    }

    const user =
      data.user || {};

    // ---------------------------------------------------------
    // Update profile card
    // ---------------------------------------------------------

    const name =
      user.name || "User";

    const email =
      user.email || "Email unavailable";

    const profileImage =
      user.profileImage || "";

    const authProvider =
      user.authProvider === "google"
        ? "Google"
        : "Email & Password";

    const verified =
      user.isEmailVerified === true;

    const avatar =
      document.getElementById(
        "profileAvatar"
      );

    const profileEditName =
      document.getElementById("profileEditName");

    const profileEditAge =
      document.getElementById("profileEditAge");

    const profileEditBloodGroup =
      document.getElementById("profileEditBloodGroup");

    const nameElement =
      document.getElementById(
        "profileName"
      );

    const emailElement =
      document.getElementById(
        "profileEmail"
      );

    const providerElement =
      document.getElementById(
        "profileProvider"
      );

    const verifiedElement =
      document.getElementById(
        "profileVerified"
      );

    // ---------------------------------------------------------
    // Name
    // ---------------------------------------------------------

    if (nameElement) {
      nameElement.textContent =
        name;
    }

    // ---------------------------------------------------------
    // Email
    // ---------------------------------------------------------

    if (emailElement) {
      emailElement.textContent =
        email;
    }

    // ---------------------------------------------------------
    // Auth provider
    // ---------------------------------------------------------

    if (providerElement) {
      providerElement.textContent =
        authProvider;
    }

    // ---------------------------------------------------------
    // Email verification
    // ---------------------------------------------------------

    if (verifiedElement) {

      verifiedElement.textContent =
        verified
          ? "Verified"
          : "Not verified";

      verifiedElement.style.color =
        verified
          ? "#15803d"
          : "#b91c1c";
    }

    // ---------------------------------------------------------
    // Profile image / initials
    // ---------------------------------------------------------

    if (avatar) {

      if (profileImage) {

        avatar.innerHTML = `
          <img
            src="${esc(profileImage)}"
            alt="Profile"
            style="
              width:100%;
              height:100%;
              object-fit:cover;
              border-radius:50%;
            "
          >
        `;

      } else {

        avatar.textContent =
          name
            .charAt(0)
            .toUpperCase();

      }
    }

    // ---------------------------------------------------------
    // Keep local profile data updated
    // ---------------------------------------------------------

    localStorage.setItem(
      "profile",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage:
          user.profileImage || null
      })
    );

  } catch (error) {

    console.error(
      "PROFILE FETCH ERROR:",
      error
    );

    const card =
      document.getElementById(
        "profileError"
      );

    if (card) {

      card.innerHTML = `
        <div class="warning">

          <b>
            Unable to load profile
          </b>

          <p>
            ${esc(
        error.message ||
        "Something went wrong."
      )}
          </p>

        </div>
      `;
    }
  }
}

function shell(active, body) {
  const links = [
    ["home.html", "⌂", "Home"],
    ["patient-history.html", "▤", "Patient Report"],
    ["ai-doctor-chatbot.html", "✦", "AI Doctor Chatbot"],
    ["history.html", "◷", "History"],
    ["settings.html", "⚙", "Settings"]
  ];

  document.getElementById("app").innerHTML = `
    <div class="app-shell">

      <aside class="side" id="side">

        <a class="brand" href="home.html">
          ♡ MediSafe <b>AI</b>
        </a>

        <nav>
          ${links.map(x => `
            <a class="${x[0] === active ? "active" : ""}" href="${x[0]}">
              ${x[1]} <span>${x[2]}</span>
            </a>
          `).join("")}
        </nav>

        <div class="side-profile">
          <a href="my-profile.html">

            <span class="side-avatar">
              ${esc((p.name || "G")[0].toUpperCase())}
            </span>

            <span>
              <b>${esc(p.name)}</b>
              <small>My Profile</small>
            </span>

          </a>
        </div>

      </aside>


      <div class="main">

        <header class="head">

          <div class="head-spacer"></div>

          <div class="profile-menu">

            <button
              class="profile-chip"
              type="button"
              onclick="toggleProfileMenu()"
              aria-label="Open profile menu"
            >

              <span class="avatar">
                ${esc((p.name || "G")[0].toUpperCase())}
              </span>

              <span class="profile-name">
                ${esc(p.name)}
              </span>

            </button>


            <div
              class="profile-dropdown"
              id="profileDropdown"
            >

              <a href="my-profile.html">
                ○ <span>My Profile</span>
              </a>

              <a href="settings.html">
                ⚙ <span>Settings</span>
              </a>

              <button
                type="button"
                onclick="logout()"
              >
                ↪ <span>Log out</span>
              </button>

            </div>

          </div>

        </header>


        <main class="content">
          ${body}
        </main>

      </div>

    </div>


    <nav class="mobile-nav">

      ${links.map(x => `
        <a class="${x[0] === active ? "active" : ""}" href="${x[0]}">
          ${x[1]}
          <small>${x[2]}</small>
        </a>
      `).join("")}

    </nav>
  `;
}


function toggleProfileMenu() {

  const menu =
    document.getElementById("profileDropdown");

  if (menu) {
    menu.classList.toggle("show");
  }
}


function logout() {

  localStorage.removeItem("profile");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("meds");
  localStorage.removeItem("allergy");
  localStorage.removeItem("medisafe_verified");
  localStorage.removeItem("pending_signup");

  sessionStorage.clear();

  location.href = "login.html";
}


document.addEventListener("click", e => {

  const wrap =
    document.querySelector(".profile-menu");

  const menu =
    document.getElementById("profileDropdown");

  if (
    menu &&
    wrap &&
    !wrap.contains(e.target)
  ) {
    menu.classList.remove("show");
  }

});


// =============================================================
// HOME
// =============================================================

function home() {

  shell("home.html", `

    <div class="app-home">

      <div class="home-top">

        <div>

          <small>MEDISAFE AI</small>

          <h1>
            Hi ${esc(p.name.split(" ")[0])} 👋
          </h1>

          <p>
            Your health space, simple and organised.
          </p>

        </div>


        <a
          class="home-avatar"
          href="my-profile.html"
        >
          ${esc((p.name || "G")[0].toUpperCase())}
        </a>

      </div>


      <section class="app-hero">

        <div class="hero-content">

          <span class="hero-badge">
            SMART MEDICINE CARE
          </span>

          <h2>
            Your medicines,
            <br>
            <span>safer & simpler.</span>
          </h2>

          <p>
            Search medicines, check combinations
            and keep your health information organised.
          </p>

          <a
            class="btn"
            href="checker.html"
          >
            Check medicines <b>→</b>
          </a>

        </div>

        <div class="capsule"></div>

      </section>


      <section class="section">

        <div class="section-title">

          <h2>Quick access</h2>

          <a href="settings.html">
            More
          </a>

        </div>


        <div class="tiles main-tiles">

          <a
            class="tile tile-green"
            href="medicines.html"
          >
            <span class="icon">💊</span>
            <strong>My Medicines</strong>
            <small>Manage medicines</small>
          </a>


          <a
            class="tile tile-blue"
            href="checker.html"
          >
            <span class="icon">⚕</span>
            <strong>Interaction Check</strong>
            <small>Check combinations</small>
          </a>


          <a
            class="tile tile-cream"
            href="prescription-ocr.html"
          >
            <span class="icon">▧</span>
            <strong>Prescription OCR</strong>
            <small>Scan a prescription</small>
          </a>


          <a
            class="tile tile-lilac"
            href="reminders.html"
          >
            <span class="icon">⏰</span>
            <strong>Reminders</strong>
            <small>Medicine schedule</small>
          </a>

        </div>

      </section>


      <section class="section">

        <div class="section-title">
          <h2>Health tools</h2>
        </div>


        <div class="tool-pills">

          <a href="allergies.html">
            ⚠ Allergies
          </a>

          <a href="symptom-checker.html">
            ✦ Symptom Checker
          </a>

          <a href="doctor-mode.html">
            ⚕ Doctor Mode
          </a>

          <a href="languages.html">
            文 Language
          </a>

          <a href="ai-doctor-chatbot.html">
            ✦ AI Doctor Chat
          </a>

        </div>

      </section>


      <section class="section">

        <div class="section-title">

          <h2>My medicine cabinet</h2>

          <a href="patient-history.html">
            Patient Report
          </a>

        </div>


        <div class="ui-card cabinet-mini">

          <div class="pill-icon">
            💊
          </div>

          <div class="grow">

            <b>
              ${meds.length} medicines
            </b>

            <p>
              ${meds.slice(0, 3).map(esc).join(" · ")}
            </p>

          </div>

          <a href="medicines.html">
            →
          </a>

        </div>

      </section>

    </div>

  `);
}


// =============================================================
// MEDICINES
// =============================================================

function medicines() {

  shell("medicines.html", `

    <div class="section-title">

      <div>

        <small>MEDICINE LIBRARY</small>

        <h1>
          My Medicines
        </h1>

      </div>

    </div>


    <div class="search">

      <input
        id="q"
        placeholder="Search generic or brand medicine"
        autocomplete="off"
      >

      <button type="button">
        Search
      </button>

    </div>


    <div
      class="card-grid"
      id="results"
    ></div>

  `);


  const data = [
    "Paracetamol",
    "Metformin",
    "Amlodipine",
    "Cetirizine",
    "Amoxicillin",
    "Ibuprofen"
  ];


  const q =
    document.getElementById("q");

  const results =
    document.getElementById("results");


  function render(list) {

    results.innerHTML =
      list.map(n => `

        <article class="ui-card medicine">

          <div class="pill-icon">
            💊
          </div>

          <h3>
            ${esc(n)}
          </h3>

          <span class="tag">
            Medicine
          </span>

          <p class="muted">
            Generic/brand information will
            come from the backend API.
          </p>

          <button
            class="btn"
            type="button"
            onclick="alert('Details screen ready for API integration')"
          >
            View details
          </button>

        </article>

      `).join("");
  }


  render(data);


  q.addEventListener("input", () => {

    const value =
      q.value.toLowerCase().trim();

    render(
      data.filter(
        x =>
          x.toLowerCase().includes(value)
      )
    );

  });

}


// =============================================================
// MEDICINE INTERACTION CHECK
// =============================================================

function checker() {

  shell("checker.html", `

    <small>
      SAFETY CHECK
    </small>

    <h1>
      Interaction Check
    </h1>


    <div class="tool">

      <div class="form-grid">

        <div class="field">

          <label>
            Medicine 1
          </label>

          <input
            id="a"
            type="text"
            placeholder="e.g. Paracetamol"
            autocomplete="off"
          >

        </div>


        <div class="field">

          <label>
            Medicine 2
          </label>

          <input
            id="b"
            type="text"
            placeholder="e.g. Ibuprofen"
            autocomplete="off"
          >

        </div>

      </div>


      <div
        class="field"
        style="margin-top:18px"
      >

        <label>
          Analysis Mode
        </label>

        <select id="medicineMode">

          <option value="normal">
            Normal
          </option>

          <option value="expert">
            Expert
          </option>

        </select>

      </div>


      <button
        id="checkMedicineBtn"
        class="btn"
        style="margin-top:18px"
        onclick="check()"
        type="button"
      >
        Check interaction
      </button>


      <div
        id="result"
        style="margin-top:18px"
      ></div>

    </div>


    <p class="muted">
      This frontend displays API-derived results.
      It is not medical advice.
    </p>

  `);

}


// =============================================================
// MEDICINE ANALYSIS API
// =============================================================

async function check() {

  const medicineName1 =
    document.getElementById("a").value.trim();

  const medicineName2 =
    document.getElementById("b").value.trim();

  const mode =
    document.getElementById("medicineMode").value;

  const result =
    document.getElementById("result");

  const button =
    document.getElementById("checkMedicineBtn");


  if (!medicineName1 || !medicineName2) {

    result.innerHTML = `

      <div class="warning">

        <b>
          Enter both medicines.
        </b>

        <p>
          Please enter Medicine 1 and Medicine 2.
        </p>

      </div>

    `;

    return;
  }


  const token =
    localStorage.getItem("token");


  if (!token) {

    result.innerHTML = `

      <div class="warning">

        <b>
          Authentication required.
        </b>

        <p>
          Please login before analysing medicines.
        </p>

      </div>

    `;

    return;
  }


  if (button) {

    button.disabled = true;

    button.dataset.originalText =
      button.innerHTML;

    button.innerHTML =
      "Analysing...";

  }


  result.innerHTML = `

  <div class="medicine-analysis-skeleton">

    <!-- Skeleton Header -->
    <div class="skeleton-header">

      <div>
        <div class="skeleton-line skeleton-small"></div>
        <div class="skeleton-line skeleton-title"></div>
      </div>

      <div class="skeleton-badge"></div>

    </div>


    <!-- Skeleton Result Card -->
    <div class="skeleton-card">

      <div class="skeleton-line skeleton-heading"></div>

      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text short"></div>

    </div>


    <!-- Skeleton Analysis Card -->
    <div class="skeleton-card">

      <div class="skeleton-line skeleton-heading"></div>

      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text medium"></div>

    </div>


    <!-- Skeleton Information Card -->
    <div class="skeleton-card">

      <div class="skeleton-line skeleton-heading"></div>

      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text short"></div>

    </div>

  </div>

`;


  try {

    const response =
      await fetch(
        `${API_BASE_URL}/api/medicine/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            "Authorization":
              `Bearer ${token}`
          },

          body: JSON.stringify({
            medicineName1,
            medicineName2,
            mode
          })
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      data.success === false
    ) {

      throw new Error(
        data.message ||
        "Medicine analysis failed."
      );

    }


    renderMedicineAnalysis(data);


  } catch (error) {

    console.error(
      "Medicine analysis error:",
      error
    );


    result.innerHTML = `

      <div class="warning">

        <b>
          Medicine analysis failed
        </b>

        <p>
          ${esc(
      error.message ||
      "Unable to analyse medicines."
    )}
        </p>

      </div>

    `;


  } finally {

    if (button) {

      button.disabled = false;

      if (button.dataset.originalText) {

        button.innerHTML =
          button.dataset.originalText;

      }

    }

  }

}


// =============================================================
// MEDICINE ANALYSIS RESULT
// =============================================================

function renderMedicineAnalysis(data) {
  const result =
    document.getElementById("result");

  const analysisData =
    data?.data &&
      typeof data.data === "object"
      ? data.data
      : data || {};

  const medicine1Data =
    analysisData.medicine1 || {};

  const medicine2Data =
    analysisData.medicine2 || {};

  const medicine1 =
    medicine1Data.medicine ||
    medicine1Data.normalizedName ||
    "Medicine 1";

  const medicine2 =
    medicine2Data.medicine ||
    medicine2Data.normalizedName ||
    "Medicine 2";

  const medicine1Rxcui =
    medicine1Data.rxcui ||
    "N/A";

  const medicine2Rxcui =
    medicine2Data.rxcui ||
    "N/A";

  const riskLevel =
    analysisData.riskLevel ||
    "Unable to determine";

  const mode =
    analysisData.mode === "expert"
      ? "Expert"
      : "Normal";

  const interactionEvidence =
    analysisData.interactionEvidence || {};

  const rawAnalysis =
    analysisData.interactionAnalysis;

  const analysis =
    typeof rawAnalysis === "string"
      ? rawAnalysis
      : rawAnalysis?.analysis ||
      rawAnalysis?.explanation ||
      rawAnalysis?.summary ||
      "Information not available in the retrieved medical data.";

  // =============================================================
  // RISK LEVEL COLOR
  // =============================================================

  let riskStyle =
    "background:#f3f4f6;color:#4b5563;border:1px solid #d1d5db;";

  if (riskLevel === "Low") {
    riskStyle =
      "background:#dcfce7;color:#15803d;border:1px solid #86efac;";
  }

  if (riskLevel === "Moderate") {
    riskStyle =
      "background:#ffedd5;color:#c2410c;border:1px solid #fdba74;";
  }

  if (
    riskLevel === "High" ||
    riskLevel === "Critical"
  ) {
    riskStyle =
      "background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;";
  }

  // =============================================================
  // DIRECT PAIR EVIDENCE
  // =============================================================

  const directPairAvailable =
    interactionEvidence
      .directPairEvidenceAvailable === true;

  const directPairEvidence =
    interactionEvidence.directPairEvidence;

  let evidenceHTML = "";

  if (directPairAvailable) {
    evidenceHTML = `
      <div class="ui-card">

        <h3>
          Direct Interaction Evidence
        </h3>

        <p>
          Direct pair-specific interaction
          evidence is available.
        </p>

        ${directPairEvidence
        ? `
              <p class="muted">
                ${esc(
          typeof directPairEvidence === "string"
            ? directPairEvidence
            : JSON.stringify(
              directPairEvidence
            )
        )}
              </p>
            `
        : ""
      }

      </div>
    `;
  } else {
    evidenceHTML = `
      <div class="ui-card">

        <h3>
          Interaction Evidence
        </h3>

        <p>
          No direct pair-specific interaction
          evidence was available in the
          retrieved medical data.
        </p>

        <p class="muted">
          General warnings or safety information
          are not being treated as proof of a
          direct interaction.
        </p>

      </div>
    `;
  }

  // =============================================================
  // DOCTOR / PHARMACIST ADVICE
  // =============================================================

  let medicalAdviceHTML = "";

  if (
    riskLevel === "High" ||
    riskLevel === "Critical"
  ) {
    medicalAdviceHTML = `
      <div
        class="ui-card"
        style="
          margin-top:15px;
          background:#fff1f2;
          border:1px solid #fca5a5;
        "
      >

        <h3 style="color:#b91c1c;">
          Medical Attention Recommended
        </h3>

        <p>
          Because this analysis indicates a
          ${esc(riskLevel.toLowerCase())} risk level,
          do not start, stop, combine, or change
          medicines based only on this analysis.
        </p>

        <p>
          Please consult a qualified doctor or
          pharmacist for personalized medical advice
          before taking or changing these medicines.
        </p>

      </div>
    `;
  } else {
    medicalAdviceHTML = `
      <div
        class="ui-card"
        style="margin-top:15px"
      >

        <h3>
          Doctor / Pharmacist Advice
        </h3>

        <p class="muted">
          This analysis is for educational and
          informational purposes only. Consult a
          qualified doctor or pharmacist for
          personalized medical advice.
        </p>

      </div>
    `;
  }

  // =============================================================
  // FINAL RESULT UI
  // =============================================================

  result.innerHTML = `

    <div class="ui-card">

      <div class="section-title">

        <div>

          <small>
            ${mode.toUpperCase()} ANALYSIS
          </small>

          <h2>
            ${esc(medicine1)}
            +
            ${esc(medicine2)}
          </h2>

        </div>

        <span
          class="tag"
          style="${riskStyle}"
        >
          ${esc(riskLevel)}
        </span>

      </div>


      <!-- Risk Level -->

      <div
        class="ui-card"
        style="margin-top:15px"
      >

        <h3>
          Risk Level
        </h3>

        <p>

          <strong
            style="${riskStyle}"
          >
            ${esc(riskLevel)}
          </strong>

        </p>

      </div>


      <!-- AI Analysis -->

      <div
        class="ui-card"
        style="margin-top:15px"
      >

        <h3>
          AI Analysis
        </h3>

        <p>
          ${esc(analysis)}
        </p>

      </div>


      <!-- Interaction Evidence -->

      <div style="margin-top:15px">

        ${evidenceHTML}

      </div>


      <!-- Doctor Advice -->

      ${medicalAdviceHTML}


      <!-- Medicine Information -->

      <div
        class="ui-card"
        style="margin-top:15px"
      >

        <h3>
          Medicine Information
        </h3>

        <p class="muted">

          ${esc(medicine1)}
          — RxCUI:
          ${esc(medicine1Rxcui)}

        </p>

        <p class="muted">

          ${esc(medicine2)}
          — RxCUI:
          ${esc(medicine2Rxcui)}

        </p>

      </div>


      <!-- General Disclaimer -->

      <div
        class="ui-card"
        style="margin-top:15px"
      >

        <p class="muted">
          This analysis is based on retrieved
          medical information and is provided for
          educational and informational purposes
          only. It is not a diagnosis, prescription,
          or personalized medical advice.
        </p>

      </div>

    </div>

  `;
}


// =============================================================
// HISTORY - BACKEND
// =============================================================

async function historyPage() {

  shell("history.html", `

    <small>
      SAFETY LOG
    </small>

    <h1>
      Check History
    </h1>

    <div
      class="ui-card"
      id="historyContainer"
    >

      <p class="muted">
        Loading your history...
      </p>

    </div>

  `);


  const container =
    document.getElementById(
      "historyContainer"
    );


  const token =
    localStorage.getItem("token");


  if (!token) {

    container.innerHTML = `

      <div class="warning">

        <b>
          Authentication required.
        </b>

        <p>
          Please login to view your history.
        </p>

        <a
          class="btn"
          href="login.html"
        >
          Login →
        </a>

      </div>

    `;

    return;
  }


  try {

    const response =
      await fetch(
        `${API_BASE_URL}/api/history`,
        {
          method: "GET",

          headers: {
            "Authorization":
              `Bearer ${token}`
          }
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      data.success === false
    ) {

      throw new Error(
        data.message ||
        "Unable to fetch history."
      );

    }


    const history =
      Array.isArray(data.data)
        ? data.data
        : [];


    if (history.length === 0) {

      container.innerHTML = `

        <div class="ui-card">

          <div class="pill-icon">
            ◷
          </div>

          <h3>
            No checks yet
          </h3>

          <p class="muted">
            Your medicine searches and
            prescription analyses will
            appear here.
          </p>

        </div>

      `;

      return;
    }


    container.innerHTML = `

      <div class="section-title">

        <div>

          <h3>
            Your Activity
          </h3>

          <p class="muted">
            ${history.length}
            ${history.length === 1
        ? "record"
        : "records"
      }
          </p>

        </div>

      </div>


      <div class="rows">

        ${history.map(item => {

        const medicine1 =
          item.medicine1 || "";

        const medicine2 =
          item.medicine2 || "";


        let title =
          "Medicine Analysis";


        if (
          medicine1 &&
          medicine2
        ) {

          title =
            `${medicine1} + ${medicine2}`;

        } else if (medicine1) {

          title =
            medicine1;

        } else if (medicine2) {

          title =
            medicine2;

        } else if (
          item.source === "prescription"
        ) {

          title =
            "Prescription Analysis";

        }


        const source =
          item.source === "prescription"
            ? "Prescription"
            : "Medicine Check";


        const mode =
          item.mode === "expert"
            ? "Expert"
            : "Normal";


        const risk =
          item.riskLevel ||
          "Unable to determine";


        let date =
          "Date unavailable";


        if (item.createdAt) {

          const parsedDate =
            new Date(item.createdAt);


          if (
            !Number.isNaN(
              parsedDate.getTime()
            )
          ) {

            date =
              parsedDate.toLocaleString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }
              );

          }

        }


        return `

              <div class="row">

                <span class="pill-icon">

                  ${item.source === "prescription"
            ? "▧"
            : "💊"
          }

                </span>


                <div class="grow">

                  <b>
                    ${esc(title)}
                  </b>

                  <small>

                    ${esc(source)}
                    ·
                    ${esc(mode)}
                    ·
                    ${esc(date)}

                  </small>

                </div>


                <span class="tag">
                  ${esc(risk)}
                </span>

              </div>

            `;

      }).join("")
      }

      </div>

    `;


  } catch (error) {

    console.error(
      "HISTORY FETCH ERROR:",
      error
    );


    container.innerHTML = `

      <div class="warning">

        <b>
          Unable to load history
        </b>

        <p>
          ${esc(
      error.message ||
      "Something went wrong while loading history."
    )}
        </p>


        <button
          class="btn"
          type="button"
          onclick="historyPage()"
        >
          Try Again
        </button>

      </div>

    `;

  }

}

// =============================================================
// PATIENT
// =============================================================

// =============================================================
// PATIENT REPORT
// =============================================================

function patient() {
  shell("patient-history.html", `
   
    <small>
      MY HEALTH SPACE
    </small>

    <h1>
      Patient Report
    </h1>

    <div class="ui-card">

      <div class="section-title">
        <div>
          <h3>
            Medical Reports
          </h3>

          <p class="muted">
            Upload and manage your medical reports securely.
          </p>
        </div>
      </div>

      <!-- Upload Medical Report -->

      <div
        class="ui-card"
        style="margin-top:15px"
      >

        <h3>
          Upload Medical Report
        </h3>

        <p class="muted">
          Upload your medical report as PDF or image.
        </p>

        <input
          type="file"
          id="medicalReportFile"
          accept=".pdf,image/jpeg,image/png,image/jpg"
          style="margin-top:12px"
        >

        <button
          class="btn"
          type="button"
          style="margin-top:15px"
          onclick="uploadMedicalReport()"
        >
          Upload Report
        </button>

        <div
          id="medicalReportUploadStatus"
          style="margin-top:15px"
        ></div>

      </div>

      <!-- Reports will appear here -->

      <div
        id="medicalReportsList"
        style="margin-top:20px"
      >

        <div class="ui-card">
          Loading medical reports...
        </div>

      </div>

    </div>

  `);

  loadMedicalReports();
}

// =============================================================
// LOAD MEDICAL REPORTS
// =============================================================

async function loadMedicalReports() {
  const container =
    document.getElementById("medicalReportsList");

  if (!container) {
    return;
  }

  try {
    const token =
      localStorage.getItem("token");

    if (!token) {
      container.innerHTML = `
        <div class="warning">
          Authentication required. Please login again.
        </div>
      `;
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/reports`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Unable to fetch medical reports"
      );
    }

    const reports =
      Array.isArray(data.reports)
        ? data.reports
        : [];

    if (!reports.length) {
      container.innerHTML = `
        <div class="ui-card">
          <h3>No medical reports yet</h3>

          <p class="muted">
            Upload your first medical report above.
          </p>
        </div>
      `;

      return;
    }

    container.innerHTML = `
      <h3>
        Your Medical Reports
      </h3>

      ${reports.map(report => `

        <div
          class="ui-card"
          style="margin-top:15px"
        >

          <div class="row">

            <span>
              📄
            </span>

            <div class="grow">

              <b>
                ${esc(
      report.originalName ||
      "Medical Report"
    )}
              </b>

              <small>
                ${esc(
      report.fileType ||
      "Unknown file type"
    )}
              </small>

              <small>
                ${new Date(
      report.createdAt
    ).toLocaleString()}
              </small>

            </div>

          </div>

          <div
            style="
              display:flex;
              gap:10px;
              margin-top:15px;
              flex-wrap:wrap;
            "
          >

            <a
              class="btn"
              href="${esc(report.fileUrl)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Report
            </a>

            <button
              class="btn"
              type="button"
              onclick="deleteMedicalReport('${esc(
      report._id
    )}')"
            >
              Delete
            </button>

          </div>

        </div>

      `).join("")}
    `;

  } catch (error) {

    console.error(
      "LOAD MEDICAL REPORTS ERROR:",
      error
    );

    container.innerHTML = `
      <div class="warning">
        Unable to load medical reports.
      </div>
    `;
  }
}


// =============================================================
// UPLOAD MEDICAL REPORT
// =============================================================

async function uploadMedicalReport() {
  const fileInput =
    document.getElementById("medicalReportFile");

  const status =
    document.getElementById(
      "medicalReportUploadStatus"
    );

  if (!fileInput || !fileInput.files.length) {
    status.innerHTML = `
      <div class="warning">
        Please select a medical report first.
      </div>
    `;

    return;
  }

  const file = fileInput.files[0];

  try {
    status.innerHTML = `
      <div class="ui-card">
        Uploading medical report...
      </div>
    `;

    const token =
      localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Authentication required. Please login again."
      );
    }

    const formData = new FormData();

    formData.append(
      "report",
      file
    );

    const response = await fetch(
      `${API_BASE_URL}/api/reports/upload`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      }
    );

    const data =
      await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Medical report upload failed"
      );
    }

    status.innerHTML = `
      <div class="success">
        Medical report uploaded successfully.
      </div>
    `;

    fileInput.value = "";

    await loadMedicalReports();

  } catch (error) {

    console.error(
      "UPLOAD MEDICAL REPORT ERROR:",
      error
    );

    status.innerHTML = `
      <div class="warning">
        ${esc(
      error.message ||
      "Failed to upload medical report."
    )}
      </div>
    `;
  }
}

// =============================================================
// DELETE MEDICAL REPORT
// =============================================================

async function deleteMedicalReport(reportId) {
  if (!reportId) {
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete this medical report?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const token =
      localStorage.getItem("token");

    if (!token) {
      alert(
        "Authentication required. Please login again."
      );

      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/reports/${reportId}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Failed to delete medical report"
      );
    }

    await loadMedicalReports();

  } catch (error) {

    console.error(
      "DELETE MEDICAL REPORT ERROR:",
      error
    );

    alert(
      error.message ||
      "Failed to delete medical report."
    );
  }
}


// =============================================================
// GENERIC PAGES
// =============================================================

function generic(
  title,
  small,
  body,
  active
) {

  shell(active, `

    <small>
      ${small}
    </small>

    <h1>
      ${title}
    </h1>

    ${body}

  `);

}


// =============================================================
// AI DOCTOR CHATBOT
// =============================================================

function aiDoctorChatbot() {

  shell("ai-doctor-chatbot.html", `

    <div class="chat-page">

      <div class="section-title">

        <div>

          <small>
            AI HEALTH ASSISTANT
          </small>

          <h1>
            AI Doctor Chatbot
          </h1>

          <p>
            Ask general medicine and health-information
            questions.
          </p>

        </div>

      </div>


      <div class="chat-intro">

  <span class="chat-logo">
    ✦
  </span>

  <div class="chat-intro-info">

    <b>
      MediSafe AI Assistant
    </b>

    <small>
      Informational support • Not a diagnosis
    </small>

  </div>


  <!-- Previous Chats Menu -->
  <button
    type="button"
    class="chat-more-btn"
    aria-label="Previous chats"
    title="Previous chats"
  >
    ⋮
  </button>

</div>


        <div
          class="chat-messages"
          id="chatMessages"
        >

          <div class="chat-bubble bot">
            Loading previous conversation...
          </div>

        </div>


        <form
          class="chat-input"
          onsubmit="sendChat(event)"
        >

          <input
            id="chatInput"
            placeholder="Ask about a medicine or symptom..."
            autocomplete="off"
          >

          <button
            class="btn"
            type="submit"
          >
            Send
          </button>

        </form>


        <p class="muted chat-disclaimer">

          For emergencies, severe symptoms,
          pregnancy, children or prescription
          decisions, consult a qualified
          healthcare professional.

        </p>

      </div>

    </div>

  `);

  // Load previous AI chat history
  loadChatHistory();

}

// =============================================================
// LOAD AI DOCTOR CHAT HISTORY
// =============================================================

async function loadChatHistory() {

  const box =
    document.getElementById("chatMessages");

  if (!box) {
    return;
  }

  const token =
    localStorage.getItem("token");

  if (!token) {

    box.innerHTML = `
      <div class="chat-bubble bot">
        Please login first to use the AI Doctor.
      </div>
    `;

    return;
  }


  try {

    const response =
      await fetch(
        `${API_BASE_URL}/api/ai/chat/history`,
        {
          method: "GET",

          headers: {
            "Authorization":
              `Bearer ${token}`
          }
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      data.success === false
    ) {

      throw new Error(
        data.message ||
        "Unable to load chat history."
      );

    }


    const history =
      Array.isArray(data?.data?.messages)
        ? data.data.messages
        : [];


    // No previous messages
    if (history.length === 0) {

      if (box.children.length === 0) {

        box.innerHTML = `

      <div class="chat-bubble bot">

        Hi! I can help explain medicines,
        common side effects and general
        health information. What would
        you like to know?

      </div>

    `;

      }

      return;
    }


    // Render previous messages
    box.innerHTML =
      history.map(item => {

        const role =
          item.role === "user"
            ? "user"
            : "bot";

        const content =
          item.content ||
          item.message ||
          item.text ||
          "";

        return `

          <div class="chat-bubble ${role}">
            ${esc(content).replace(/\n/g, "<br>")}
          </div>

        `;

      }).join("");


    // Scroll to latest message
    box.scrollTop =
      box.scrollHeight;


  } catch (error) {

    console.error(
      "CHAT HISTORY FETCH ERROR:",
      error
    );


    box.innerHTML = `

      <div class="chat-bubble bot">

        Hi! I can help explain medicines,
        common side effects and general
        health information. What would
        you like to know?

      </div>

    `;

  }

}


async function sendChat(e) {

  e.preventDefault();

  const input =
    document.getElementById("chatInput");

  const box =
    document.getElementById("chatMessages");

  const msg =
    input.value.trim();

  if (!msg) {
    return;
  }

  // Show user message
  box.insertAdjacentHTML(
    "beforeend",
    `
      <div class="chat-bubble user">
        ${esc(msg)}
      </div>
    `
  );

  input.value = "";

  // Loading message
  const loadingId =
    "ai-chat-loading-" + Date.now();

  box.insertAdjacentHTML(
    "beforeend",
    `
      <div
        class="chat-bubble bot"
        id="${loadingId}"
      >
        Thinking...
      </div>
    `
  );

  box.scrollTop = box.scrollHeight;

  try {

    const token =
      localStorage.getItem("token");

    if (!token) {

      const loading =
        document.getElementById(loadingId);

      if (loading) {
        loading.textContent =
          "Please login first to use the AI Doctor.";
      }

      return;
    }

    // Call AI Doctor backend
    const response =
      await fetch(
        `${API_BASE_URL}/api/ai/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            "Authorization":
              `Bearer ${token}`
          },

          body: JSON.stringify({
            message: msg
          })
        }
      );

    const data =
      await response.json();

    // Remove loading message
    const loading =
      document.getElementById(loadingId);

    if (loading) {
      loading.remove();
    }

    if (
      !response.ok ||
      data.success === false
    ) {

      box.insertAdjacentHTML(
        "beforeend",
        `
          <div class="chat-bubble bot">
            Sorry, I couldn't process your question
            right now. Please try again.
          </div>
        `
      );

      return;
    }

    // Get AI answer
    const answer =
      data?.data?.answer ||
      "Sorry, I couldn't generate an answer.";

    // Show AI response
    box.insertAdjacentHTML(
      "beforeend",
      `
        <div class="chat-bubble bot">
          ${esc(answer).replace(/\n/g, "<br>")}
        </div>
      `
    );

    box.scrollTop = box.scrollHeight;

  } catch (error) {

    console.error(
      "AI CHAT FRONTEND ERROR:",
      error
    );

    const loading =
      document.getElementById(loadingId);

    if (loading) {
      loading.remove();
    }

    box.insertAdjacentHTML(
      "beforeend",
      `
        <div class="chat-bubble bot">
          Sorry, I'm unable to connect to the
          AI Doctor right now. Please try again.
        </div>
      `
    );

  }

}


// =============================================================
// PRESCRIPTION HELPERS
// =============================================================

function getPrescriptionPayload(data) {

  if (
    data?.data &&
    typeof data.data === "object"
  ) {

    return data.data;

  }

  return data || {};

}


function getPrescriptionId(data) {

  const payload =
    getPrescriptionPayload(data);


  return (
    payload.prescriptionId ||
    payload._id ||
    payload.prescription?._id ||
    payload.prescription?.id ||
    null
  );

}


function getPrescriptionMedicines(data) {

  const payload =
    getPrescriptionPayload(data);


  return (
    payload.medicines ||
    payload.prescription?.medicines ||
    payload.ocrResult?.medicines ||
    payload.ocr?.medicines ||
    []
  );

}


function renderPrescriptionMedicines(
  medicines
) {

  if (
    !Array.isArray(medicines) ||
    medicines.length === 0
  ) {

    return `

      <div class="ui-card">

        <b>
          No medicines were detected.
        </b>

        <p class="muted">
          Please make sure the prescription
          image is clear and readable.
        </p>

      </div>

    `;

  }


  return medicines.map(
    (medicine, index) => {

      const name =
        medicine.normalizedName ||
        medicine.originalName ||
        medicine.name ||
        "Unknown medicine";


      const originalName =
        medicine.originalName ||
        medicine.name ||
        name;


      const rxcui =
        medicine.rxcui ||
        "N/A";


      const validated =
        medicine.validated === true;


      const confidence =
        medicine.confidence ||
        "N/A";


      const strength =
        medicine.strength ||
        "Not specified";


      const instructions =
        medicine.instructions ||
        "Not specified";


      return `

        <div class="ui-card prescription-medicine">

          <div class="section-title">

            <div>

              <small>
                MEDICINE ${index + 1}
              </small>

              <h3>
                ${esc(name)}
              </h3>

            </div>

            <span class="tag">

              ${validated
          ? "Validated"
          : "Unrecognized"
        }

            </span>

          </div>


          ${originalName !== name

          ? `

                  <p class="muted">
                    OCR name:
                    ${esc(originalName)}
                  </p>

                `

          : ""
        }


          <div class="rows">

            <div class="row">

              <span>
                RxCUI
              </span>

              <div class="grow">

                <b>
                  ${esc(rxcui)}
                </b>

              </div>

            </div>


            <div class="row">

              <span>
                Strength
              </span>

              <div class="grow">

                <b>
                  ${esc(strength)}
                </b>

              </div>

            </div>


            <div class="row">

              <span>
                Instructions
              </span>

              <div class="grow">

                <b>
                  ${esc(instructions)}
                </b>

              </div>

            </div>


            <div class="row">

              <span>
                Confidence
              </span>

              <div class="grow">

                <b>
                  ${esc(confidence)}
                </b>

              </div>

            </div>

          </div>


          ${validated

          ? `

                  <p
                    class="success"
                    style="margin-top:12px"
                  >
                    ✓ Medicine validated through RxNorm.
                  </p>

                `

          : `

                  <div
                    class="warning"
                    style="margin-top:12px"
                  >

                    <b>
                      Medicine could not be validated.
                    </b>

                    <p>
                      This medicine is stored from OCR,
                      but it will not be treated as a
                      trusted medicine identity for full
                      medical analysis.
                    </p>

                  </div>

                `
        }

        </div>

      `;

    }
  ).join("");

}


// =============================================================
// PRESCRIPTION ANALYSIS RESULT
// =============================================================

function renderPrescriptionAnalysis(data) {

  const payload =
    getPrescriptionPayload(data);


  const medicines =
    payload.medicines || [];


  const riskLevel =
    payload.riskLevel ||
    "Unable to determine";


  const interactionEvidence =
    payload.interactionEvidence || {};


  const rawAnalysis =
    payload.interactionAnalysis;


  const analysis =
    typeof rawAnalysis === "string"
      ? rawAnalysis
      : rawAnalysis?.analysis ||
      rawAnalysis?.explanation ||
      rawAnalysis?.summary ||
      "Information not available in the retrieved medical data.";


  const mode =
    payload.mode === "expert"
      ? "Expert"
      : "Normal";


  const directPairAvailable =
    interactionEvidence
      .directPairEvidenceAvailable === true;


  let evidenceHTML = "";


  if (directPairAvailable) {

    evidenceHTML = `

      <div class="ui-card">

        <h3>
          Direct Interaction Evidence
        </h3>

        <p>
          Direct pair-specific interaction
          evidence is available.
        </p>

      </div>

    `;

  } else {

    evidenceHTML = `

      <div class="ui-card">

        <h3>
          Interaction Evidence
        </h3>

        <p>
          No direct pair-specific interaction
          evidence was available in the
          retrieved medical data.
        </p>

        <p class="muted">
          General warnings or safety information
          are not being treated as proof of a
          direct interaction.
        </p>

      </div>

    `;

  }


  return `

    <div class="ui-card">

      <div class="section-title">

        <div>

          <small>
            ${mode.toUpperCase()} PRESCRIPTION ANALYSIS
          </small>

          <h2>
            Analysis Result
          </h2>

        </div>

        <span class="tag">
          ${esc(riskLevel)}
        </span>

      </div>


      <div
        class="ui-card"
        style="margin-top:15px"
      >

        <h3>
          Medicines
        </h3>

        ${renderPrescriptionMedicines(medicines)}

      </div>


      <div
        class="ui-card"
        style="margin-top:15px"
      >

        <h3>
          AI Analysis
        </h3>

        <p>
          ${esc(analysis)}
        </p>

      </div>


      <div style="margin-top:15px">

        ${evidenceHTML}

      </div>

    </div>

  `;

}


// =============================================================
// PRESCRIPTION ANALYSIS
// =============================================================

async function analyzePrescription(
  prescriptionId,
  mode,
  result
) {

  const token =
    localStorage.getItem("token");


  if (!token) {

    result.innerHTML = `

      <div class="warning">

        <b>
          Authentication required.
        </b>

        <p>
          Please login before analysing
          a prescription.
        </p>

      </div>

    `;

    return;
  }


  if (!prescriptionId) {

    result.innerHTML = `

      <div class="warning">

        <b>
          Prescription ID is missing.
        </b>

        <p>
          Please upload the prescription again.
        </p>

      </div>

    `;

    return;
  }


  result.innerHTML = `

    <div class="ui-card">

      <b>
        Analysing prescription...
      </b>

      <p class="muted">

        ${mode === "expert"
      ? "Running Expert analysis."
      : "Running Normal analysis."
    }

      </p>

    </div>

  `;


  try {

    const response =
      await fetch(
        `${API_BASE_URL}/api/prescriptions/${encodeURIComponent(prescriptionId)}/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            "Authorization":
              `Bearer ${token}`
          },

          body: JSON.stringify({
            mode
          })
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      data.success === false
    ) {

      throw new Error(
        data.message ||
        "Prescription analysis failed."
      );

    }


    result.innerHTML =
      renderPrescriptionAnalysis(data);


  } catch (error) {

    console.error(
      "Prescription analysis error:",
      error
    );


    result.innerHTML = `

      <div class="warning">

        <b>
          Prescription analysis failed
        </b>

        <p>
          ${esc(
      error.message ||
      "Unable to analyse prescription."
    )}
        </p>

      </div>

    `;

  }

}


// =============================================================
// PRESCRIPTION UPLOAD
// =============================================================

async function uploadPrescription() {

  const fileInput =
    document.getElementById(
      "prescriptionFile"
    );


  const result =
    document.getElementById(
      "prescriptionResult"
    );


  const button =
    document.getElementById(
      "uploadPrescriptionBtn"
    );


  const file =
    fileInput?.files?.[0];


  if (!file) {

    result.innerHTML = `

      <div class="warning">

        <b>
          Select a prescription image first.
        </b>

        <p>
          Please choose a clear prescription
          image before uploading.
        </p>

      </div>

    `;

    return;
  }


  if (!file.type.startsWith("image/")) {

    result.innerHTML = `

      <div class="warning">

        Please select a valid image file.

      </div>

    `;

    return;
  }


  const token =
    localStorage.getItem("token");


  if (!token) {

    result.innerHTML = `

      <div class="warning">

        <b>
          Authentication required.
        </b>

        <p>
          Please login before uploading
          a prescription.
        </p>

      </div>

    `;

    return;
  }


  if (button) {

    button.disabled = true;

    button.dataset.originalText =
      button.innerHTML;

    button.innerHTML =
      "Uploading & Scanning...";

  }


  result.innerHTML = `

    <div class="ui-card">

      <b>
        Scanning prescription...
      </b>

      <p class="muted">
        Uploading image and extracting
        medicines. Please wait.
      </p>

    </div>

  `;


  try {

    const formData =
      new FormData();


    formData.append(
      "prescription",
      file
    );


    const response =
      await fetch(
        `${API_BASE_URL}/api/prescriptions/upload`,
        {
          method: "POST",

          headers: {
            "Authorization":
              `Bearer ${token}`
          },

          body: formData
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      data.success === false
    ) {

      throw new Error(
        data.message ||
        "Prescription upload failed."
      );

    }


    const prescriptionId =
      getPrescriptionId(data);


    const medicines =
      getPrescriptionMedicines(data);


    result.innerHTML = `

      <div class="ui-card">

        <div class="section-title">

          <div>

            <small>
              OCR COMPLETE
            </small>

            <h2>
              Prescription scanned
            </h2>

          </div>

          <span class="tag">
            Success
          </span>

        </div>


        <p class="muted">
          The prescription was uploaded
          successfully and the detected
          medicines are shown below.
        </p>


        <div style="margin-top:15px">

          ${renderPrescriptionMedicines(
      medicines
    )}

        </div>


        ${prescriptionId

        ? `

                <div
                  class="ui-card"
                  style="margin-top:15px"
                >

                  <h3>
                    Analyse Prescription
                  </h3>

                  <p class="muted">
                    Choose how you want the
                    detected validated medicines
                    to be analysed.
                  </p>


                  <div
                    style="
                      display:flex;
                      gap:10px;
                      flex-wrap:wrap;
                      margin-top:12px;
                    "
                  >

                    <button
                      class="btn"
                      type="button"
                      onclick="analyzePrescription(
                        '${esc(prescriptionId)}',
                        'normal',
                        document.getElementById(
                          'prescriptionResult'
                        )
                      )"
                    >
                      Normal Analysis →
                    </button>


                    <button
                      class="btn"
                      type="button"
                      onclick="analyzePrescription(
                        '${esc(prescriptionId)}',
                        'expert',
                        document.getElementById(
                          'prescriptionResult'
                        )
                      )"
                    >
                      Expert Analysis →
                    </button>

                  </div>

                </div>

              `

        : `

                <div
                  class="warning"
                  style="margin-top:15px"
                >

                  <b>
                    Prescription uploaded successfully.
                  </b>

                  <p>
                    Prescription ID was not returned,
                    so analysis cannot be started from
                    this screen yet.
                  </p>

                </div>

              `
      }

      </div>

    `;


  } catch (error) {

    console.error(
      "Prescription upload error:",
      error
    );


    result.innerHTML = `

      <div class="warning">

        <b>
          Prescription upload failed
        </b>

        <p>
          ${esc(
      error.message ||
      "Unable to upload prescription."
    )}
        </p>

      </div>

    `;


  } finally {

    if (button) {

      button.disabled = false;

      if (button.dataset.originalText) {

        button.innerHTML =
          button.dataset.originalText;

      }

    }

  }

}

// =============================================================
// EXTRA PAGES
// =============================================================

function extras() {

  if (path === "prescription-ocr.html") {

    generic(
      "Prescription OCR",
      "SCAN MEDICINE",

      `

        <div class="tool">

          <h3>
            Upload prescription
          </h3>

          <p class="muted">
            Upload a clear prescription image.
            MediSafe AI will extract medicines,
            validate them through RxNorm and
            show the detected information.
          </p>


          <div
            class="field"
            style="margin-top:18px"
          >

            <label>
              Prescription image
            </label>

            <input
              id="prescriptionFile"
              type="file"
              accept="image/*"
            >

          </div>


          <div
            id="prescriptionPreview"
            style="margin-top:15px"
          ></div>


          <button
            id="uploadPrescriptionBtn"
            class="btn"
            style="margin-top:15px"
            type="button"
            onclick="uploadPrescription()"
          >
            Upload & Scan Prescription
            <span>→</span>
          </button>


          <div
            id="prescriptionResult"
            style="margin-top:18px"
          ></div>

        </div>

      `,

      "prescription-ocr.html"
    );


    const fileInput =
      document.getElementById(
        "prescriptionFile"
      );


    if (fileInput) {

      fileInput.addEventListener(
        "change",
        () => {

          const file =
            fileInput.files?.[0];


          const preview =
            document.getElementById(
              "prescriptionPreview"
            );


          if (!file) {

            preview.innerHTML = "";

            return;
          }


          if (!file.type.startsWith("image/")) {

            preview.innerHTML = `

              <div class="warning">
                Please select an image file.
              </div>

            `;

            fileInput.value = "";

            return;
          }


          const objectURL =
            URL.createObjectURL(file);


          preview.innerHTML = `

            <div class="ui-card">

              <p>

                <b>
                  Selected:
                </b>

                ${esc(file.name)}

              </p>

              <img
                src="${objectURL}"
                alt="Prescription preview"
                style="
                  width:100%;
                  max-height:400px;
                  object-fit:contain;
                  border-radius:14px;
                  margin-top:10px;
                "
              >

            </div>

          `;

        }
      );

    }


  } else if (path === "reminders.html") {

    generic(
      "Medicine Reminders",
      "REMINDERS",

      `

        <div class="tool">

          <div class="form-grid">

            <div class="field">

              <label>
                Medicine
              </label>

              <input
                placeholder="Medicine name"
              >

            </div>


            <div class="field">

              <label>
                Time
              </label>

              <input type="time">

            </div>

          </div>


          <button
            class="btn"
            style="margin-top:15px"
            onclick="alert('Reminder saved in frontend demo')"
            type="button"
          >
            Add reminder
          </button>

        </div>


        <div
          class="rows"
          style="margin-top:15px"
        >

          <div class="row">

            ⏰

            <div class="grow">

              <b>
                Example reminder
              </b>

              <small>
                Daily · 8:00 AM
              </small>

            </div>

            <span class="tag">
              Active
            </span>

          </div>

        </div>

      `,

      "reminders.html"
    );


  } else if (path === "languages.html") {

    generic(
      "Language",
      "ACCESSIBILITY",

      `

        <div class="card-grid">

          ${[
        "English",
        "Hindi",
        "Marathi",
        "Bengali",
        "Tamil",
        "Telugu"
      ].map(x => `

            <button
              class="ui-card"
              onclick="alert('${x} selected')"
              type="button"
            >

              <h3>
                ${x}
              </h3>

              <span class="tag">
                Select
              </span>

            </button>

          `).join("")}

        </div>

      `,

      "languages.html"
    );


  } else if (path === "doctor-mode.html") {

    generic(
      "Doctor / Pharmacist Mode",
      "CLINICAL VIEW",

      `

        <div class="warning">

          <b>
            Professional view
          </b>

          <p>

            Frontend placeholder for detailed
            clinical evidence, interaction severity,
            source references and patient medicine
            timeline.

          </p>

        </div>


        <div class="card-grid">

          <div class="ui-card">

            <b>
              Clinical Evidence
            </b>

            <p class="muted">
              Evidence source and supporting text.
            </p>

          </div>


          <div class="ui-card">

            <b>
              Risk Factors
            </b>

            <p class="muted">
              Age, dosage, allergies and conditions.
            </p>

          </div>


          <div class="ui-card">

            <b>
              Patient Timeline
            </b>

            <p class="muted">
              Medicine and interaction history.
            </p>

          </div>

        </div>

      `,

      "doctor-mode.html"
    );


  } else if (path === "symptom-checker.html") {

    generic(
      "AI Symptom Checker",
      "AI HEALTH TOOL",

      `

        <div class="tool">

          <div class="field">

            <label>
              Describe symptoms
            </label>

            <textarea
              id="sym"
              rows="5"
              placeholder="Tell us what you are experiencing..."
            ></textarea>

          </div>


          <button
            class="btn"
            style="margin-top:14px"
            onclick="alert('AI result screen ready for backend model')"
            type="button"
          >
            Analyse symptoms
          </button>


          <p class="muted">

            Results should be treated as informational
            and not as a diagnosis.

          </p>

        </div>

      `,

      "symptom-checker.html"
    );


  } else if (path === "allergies.html") {

    generic(
      "Allergy Cross-check",
      "SAFETY PROFILE",

      `

        <div class="tool">

          <div class="field">

            <label>
              Known allergy
            </label>

            <input
              id="allergy"
              placeholder="e.g. Penicillin"
            >

          </div>


          <button
            class="btn"
            style="margin-top:14px"
            onclick="
              localStorage.setItem(
                'allergy',
                document.getElementById('allergy').value
              );
              alert('Allergy saved locally')
            "
            type="button"
          >
            Save allergy
          </button>


          <div
            class="warning"
            style="margin-top:15px"
          >

            <b>
              Conflict warning area
            </b>

            <p>

              When a medicine is searched,
              the backend will compare ingredients
              against this allergy profile.

            </p>

          </div>

        </div>

      `,

      "allergies.html"
    );


  } else if (path === "my-profile.html") {

    generic(
      "My Profile",
      "ACCOUNT",

      `

      <div
        class="ui-card"
        id="profileError"
      >

        <!-- Profile Avatar -->

        <div class="profile-avatar-wrap">

  <div
    id="profileAvatar"
    class="avatar"
  >
    ${esc(
        (p.name || "G")[0].toUpperCase()
      )}
  </div>

  <button
    type="button"
    class="profile-edit-icon profile-photo-edit"
    aria-label="Edit profile picture"
    title="Edit profile picture"
  >
    ✎
  </button>

</div>


        <!-- User Name -->

        <h2 id="profileName">
          ${esc(p.name)}
        </h2>


        <!-- User Email -->

        <p id="profileEmail">
          ${esc(p.email)}
        </p>


        <!-- Account Information -->

        <div
          class="rows"
          style="margin-top:20px"
        >

          <!-- Authentication Provider -->

          <div class="row">

            <span>
              Account
            </span>

            <div class="grow">

              <b id="profileProvider">
                Loading...
              </b>

            </div>

          </div>


          <!-- Email Verification -->

          <div class="row">

            <span>
              Email
            </span>

            <div class="grow">

              <b id="profileVerified">
                Loading...
              </b>

            </div>

          </div>

        </div>
      <!-- Age -->

<div class="row profile-info-row">

  <span>
    Age
  </span>

  <div class="grow">
    <b>Not added</b>
  </div>

  <button
    type="button"
    class="profile-edit-icon"
    aria-label="Edit age"
    title="Edit age"
  >
    ✎
  </button>

</div>


<!-- Blood Group -->

<div class="row profile-info-row">

  <span>
    Blood Group
  </span>

  <div class="grow">
    <b>Not added</b>
  </div>

  <button
    type="button"
    class="profile-edit-icon"
    aria-label="Edit blood group"
    title="Edit blood group"
  >
    ✎
  </button>

</div>

        <!-- Settings -->

        <a
          class="btn"
          href="settings.html"
          style="margin-top:20px"
        >
          Settings →
        </a>

      </div>

    `,

      "my-profile.html"
    );


    // Load actual authenticated user
    // from backend

    loadCurrentUserProfile();


  } else if (path === "settings.html") {
    generic(
      "Settings",
      "PREFERENCES",

      `

        <div class="rows">

          <a
            class="row"
            href="languages.html"
          >

            文

            <div class="grow">

              <b>
                Language
              </b>

              <small>
                English, Hindi & regional languages
              </small>

            </div>

            <span>›</span>

          </a>


          <a
            class="row"
            href="reminders.html"
          >

            ⏰

            <div class="grow">

              <b>
                Medicine Reminders
              </b>

              <small>
                Manage your schedules
              </small>

            </div>

            <span>›</span>

          </a>


          <a
            class="row"
            href="allergies.html"
          >

            ⚠

            <div class="grow">

              <b>
                Allergies & Safety
              </b>

              <small>
                Manage known allergies
              </small>

            </div>

            <span>›</span>

          </a>


          <div class="row">

            🔔

            <div class="grow">

              <b>
                Notifications
              </b>

              <small>
                Medicine reminders
              </small>

            </div>

            <span class="tag">
              ON
            </span>

          </div>


          <div class="row">

            🌙

            <div class="grow">

              <b>
                Appearance
              </b>

              <small>
                Calm green theme
              </small>

            </div>

            <span class="tag">
              Light
            </span>

          </div>


          <a
            class="row"
            href="my-profile.html"
          >

            ○

            <div class="grow">

              <b>
                My Profile
              </b>

              <small>
                Personal information
              </small>

            </div>

            <span>›</span>

          </a>

        </div>

        <!-- Logout Button -->
        <div class="settings-logout-section">

          <button
            type="button"
            class="settings-logout-btn"
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      `,

      "settings.html"
    );

  }

}


// =============================================================
// PAGE ROUTING
// =============================================================

if (path === "home.html") {

  home();

} else if (path === "ai-doctor-chatbot.html") {

  aiDoctorChatbot();

} else if (path === "medicines.html") {

  medicines();

} else if (path === "checker.html") {

  checker();

} else if (path === "history.html") {

  historyPage();

} else if (path === "patient-history.html") {

  patient();

} else {

  extras();

}