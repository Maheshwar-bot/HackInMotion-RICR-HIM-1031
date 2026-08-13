const path=location.pathname.split("/").pop();const p=JSON.parse(localStorage.getItem("profile")||'{"name":"Guest","email":"guest@example.com"}');const meds=JSON.parse(localStorage.getItem("meds")||'["Metformin","Amlodipine","Paracetamol"]');const history=JSON.parse(localStorage.getItem("history")||"[]");
function esc(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
const links=[["home.html","⌂","Home"],["patient-history.html","▤","Patient Report"],["ai-doctor-chatbot.html","✦","AI Doctor Chatbot"],["history.html","◷","History"],["settings.html","⚙","Settings"]];
function shell(active,body){
document.getElementById("app").innerHTML=`<div class="app-shell">
<aside class="side" id="side">
  <a class="brand" href="home.html">♡ MediSafe <b>AI</b></a>
  <nav>${links.map(x=>`<a class="${x[0]===active?'active':''}" href="${x[0]}">${x[1]} <span>${x[2]}</span></a>`).join("")}</nav>
  <div class="side-profile">
    <a href="my-profile.html"><span class="side-avatar">${esc((p.name||"G")[0].toUpperCase())}</span><span><b>${esc(p.name)}</b><small>My Profile</small></span></a>
  </div>
</aside>
<div class="main">
<header class="head">
  <div class="head-spacer"></div>
  <div class="profile-menu">
    <button class="profile-chip" type="button" onclick="toggleProfileMenu()" aria-label="Open profile menu">
      <span class="avatar">${esc((p.name||"G")[0].toUpperCase())}</span><span class="profile-name">${esc(p.name)}</span>
    </button>
    <div class="profile-dropdown" id="profileDropdown">
      <a href="my-profile.html">○ <span>My Profile</span></a>
      <a href="settings.html">⚙ <span>Settings</span></a>
      <button type="button" onclick="logout()">↪ <span>Log out</span></button>
    </div>
  </div>
</header>
<main class="content">${body}</main>
</div></div>
<nav class="mobile-nav">${links.map(x=>`<a class="${x[0]===active?'active':''}" href="${x[0]}">${x[1]}<small>${x[2]}</small></a>`).join("")}</nav>`;
}
function toggleProfileMenu(){
  const menu=document.getElementById("profileDropdown");
  if(menu) menu.classList.toggle("show");
}
function logout(){
  localStorage.removeItem("profile");
  localStorage.removeItem("meds");
  localStorage.removeItem("history");
  localStorage.removeItem("allergy");
  localStorage.removeItem("medisafe_verified");
  localStorage.removeItem("pending_signup");
  sessionStorage.clear();
  location.href="login.html";
}
document.addEventListener("click",e=>{
  const wrap=document.querySelector(".profile-menu");
  const menu=document.getElementById("profileDropdown");
  if(menu && wrap && !wrap.contains(e.target)) menu.classList.remove("show");
});
function home(){
shell("home.html",`
<div class="app-home">
  <div class="home-top">
    <div><small>MEDISAFE AI</small><h1>Hi ${esc(p.name.split(" ")[0])} 👋</h1><p>Your health space, simple and organised.</p></div>
    <a class="home-avatar" href="my-profile.html">${esc((p.name||"G")[0].toUpperCase())}</a>
  </div>

  <section class="app-hero">
    <div class="hero-content">
      <span class="hero-badge">SMART MEDICINE CARE</span>
      <h2>Your medicines,<br><span>safer & simpler.</span></h2>
      <p>Search medicines, check combinations and keep your health information organised.</p>
      <a class="btn" href="checker.html">Check medicines <b>→</b></a>
    </div>
    <div class="capsule"></div>
  </section>

  <section class="section">
    <div class="section-title"><h2>Quick access</h2><a href="settings.html">More</a></div>
    <div class="tiles main-tiles">
      <a class="tile tile-green" href="medicines.html"><span class="icon">💊</span><strong>My Medicines</strong><small>Manage medicines</small></a>
      <a class="tile tile-blue" href="checker.html"><span class="icon">⚕</span><strong>Interaction Check</strong><small>Check combinations</small></a>
      <a class="tile tile-cream" href="prescription-ocr.html"><span class="icon">▧</span><strong>Prescription OCR</strong><small>Scan a prescription</small></a>
      <a class="tile tile-lilac" href="reminders.html"><span class="icon">⏰</span><strong>Reminders</strong><small>Medicine schedule</small></a>
    </div>
  </section>

  <section class="section">
    <div class="section-title"><h2>Health tools</h2></div>
    <div class="tool-pills">
      <a href="allergies.html">⚠ Allergies</a>
      <a href="symptom-checker.html">✦ Symptom Checker</a>
      <a href="doctor-mode.html">⚕ Doctor Mode</a>
      <a href="languages.html">文 Language</a>
      <a href="ai-doctor-chatbot.html">✦ AI Doctor Chat</a>
    </div>
  </section>

  <section class="section">
    <div class="section-title"><h2>My medicine cabinet</h2><a href="patient-history.html">Patient Report</a></div>
    <div class="ui-card cabinet-mini">
      <div class="pill-icon">💊</div>
      <div class="grow"><b>${meds.length} medicines</b><p>${meds.slice(0,3).map(esc).join(" · ")}</p></div>
      <a href="medicines.html">→</a>
    </div>
  </section>
</div>`);
}
function medicines(){shell("medicines.html",`<div class="section-title"><div><small>MEDICINE LIBRARY</small><h1>My Medicines</h1></div></div><div class="search"><input id="q" placeholder="Search generic or brand medicine"><button>Search</button></div><div class="card-grid" id="results"></div>`);const data=["Paracetamol","Metformin","Amlodipine","Cetirizine","Amoxicillin","Ibuprofen"];function render(a){results.innerHTML=a.map(n=>`<article class="ui-card medicine"><div class="pill-icon">💊</div><h3>${n}</h3><span class="tag">Medicine</span><p class="muted">Generic/brand information will come from the backend API.</p><button class="btn" onclick="alert('Details screen ready for API integration')">View details</button></article>`).join("")}render(data);q.oninput=()=>render(data.filter(x=>x.toLowerCase().includes(q.value.toLowerCase())));}
function checker(){shell("checker.html",`<small>SAFETY CHECK</small><h1>Interaction Check</h1><div class="tool"><div class="form-grid"><div class="field"><label>Medicine 1</label><input id="a" placeholder="e.g. Aspirin"></div><div class="field"><label>Medicine 2</label><input id="b" placeholder="e.g. Warfarin"></div></div><button class="btn" style="margin-top:18px" onclick="check()">Check interaction</button><div id="result" style="margin-top:18px"></div></div><p class="muted">This frontend displays API-derived results after backend integration. It is not medical advice.</p>`)}function check(){const a=document.getElementById("a").value,b=document.getElementById("b").value;if(!a||!b)return result.innerHTML='<div class="warning">Enter both medicines.</div>';result.innerHTML='<div class="success"><b>Risk assessment ready</b><p>The backend will return evidence, risk level and a simple explanation here.</p></div>';history.unshift({pair:a+" + "+b,level:"Pending API"});localStorage.setItem("history",JSON.stringify(history));}
function historyPage(){shell("history.html",`<small>SAFETY LOG</small><h1>Check History</h1><div class="rows">${history.length?history.map(x=>`<div class="row"><div class="grow"><b>${esc(x.pair)}</b><small>${esc(x.level)}</small></div><span class="tag">${esc(x.level)}</span></div>`).join(""):'<div class="ui-card">No checks yet.</div>'}</div>`)}
function patient(){shell("patient-history.html",`<small>MY HEALTH SPACE</small><h1>Patient History</h1><div class="ui-card"><h3>Current Medicines</h3>${meds.map(x=>`<div class="row"><span>💊</span><div class="grow"><b>${x}</b><small>Current medicine</small></div></div>`).join("")}</div>`)}
function generic(title,small,body,active){shell(active,`<small>${small}</small><h1>${title}</h1>${body}`)}
function aiDoctorChatbot(){
shell("ai-doctor-chatbot.html",`
<div class="chat-page">
  <div class="section-title"><div><small>AI HEALTH ASSISTANT</small><h1>AI Doctor Chatbot</h1><p>Ask general medicine and health-information questions.</p></div></div>
  <div class="chat-card">
    <div class="chat-intro"><span class="chat-logo">✦</span><div><b>MediSafe AI Assistant</b><small>Informational support • Not a diagnosis</small></div></div>
    <div class="chat-messages" id="chatMessages">
      <div class="chat-bubble bot">Hi! I can help explain medicines, common side effects and general health information. What would you like to know?</div>
    </div>
    <form class="chat-input" onsubmit="sendChat(event)">
      <input id="chatInput" placeholder="Ask about a medicine or symptom..." autocomplete="off">
      <button class="btn" type="submit">Send</button>
    </form>
    <p class="muted chat-disclaimer">For emergencies, severe symptoms, pregnancy, children or prescription decisions, consult a qualified healthcare professional.</p>
  </div>
</div>`);
}
function sendChat(e){
e.preventDefault();
const input=document.getElementById("chatInput"), msg=input.value.trim();
if(!msg)return;
const box=document.getElementById("chatMessages");
box.insertAdjacentHTML("beforeend",`<div class="chat-bubble user">${esc(msg)}</div>`);
input.value="";
setTimeout(()=>box.insertAdjacentHTML("beforeend",`<div class="chat-bubble bot">I can help organise this question for the medical information service. In the production version, this message will be answered using verified medicine data and the AI backend.</div>`),300);
}
function extras(){if(path==="prescription-ocr.html")generic("Prescription OCR","SCAN MEDICINE",`<div class="tool"><h3>Upload prescription or medicine strip</h3><input type="file" accept="image/*"><p class="muted">Frontend flow: upload → OCR processing → detected medicine → confirm.</p><div class="warning">OCR result will be verified by the user before adding it to medicines.</div></div>`,"prescription-ocr.html");
else if(path==="reminders.html")generic("Medicine Reminders","REMINDERS",`<div class="tool"><div class="form-grid"><div class="field"><label>Medicine</label><input placeholder="Medicine name"></div><div class="field"><label>Time</label><input type="time"></div></div><button class="btn" style="margin-top:15px" onclick="alert('Reminder saved in frontend demo')">Add reminder</button></div><div class="rows" style="margin-top:15px"><div class="row">⏰ <div class="grow"><b>Example reminder</b><small>Daily · 8:00 AM</small></div><span class="tag">Active</span></div></div>`,"reminders.html");
else if(path==="languages.html")generic("Language","ACCESSIBILITY",`<div class="card-grid">${["English","Hindi","Marathi","Bengali","Tamil","Telugu"].map(x=>`<button class="ui-card" onclick="alert('${x} selected')"><h3>${x}</h3><span class="tag">Select</span></button>`).join("")}</div>`,"languages.html");
else if(path==="doctor-mode.html")generic("Doctor / Pharmacist Mode","CLINICAL VIEW",`<div class="warning"><b>Professional view</b><p>Frontend placeholder for detailed clinical evidence, interaction severity, source references and patient medicine timeline.</p></div><div class="card-grid"><div class="ui-card"><b>Clinical Evidence</b><p class="muted">Evidence source and supporting text.</p></div><div class="ui-card"><b>Risk Factors</b><p class="muted">Age, dosage, allergies and conditions.</p></div><div class="ui-card"><b>Patient Timeline</b><p class="muted">Medicine and interaction history.</p></div></div>`,"doctor-mode.html");
else if(path==="symptom-checker.html")generic("AI Symptom Checker","AI HEALTH TOOL",`<div class="tool"><div class="field"><label>Describe symptoms</label><textarea id="sym" rows="5" placeholder="Tell us what you are experiencing..."></textarea></div><button class="btn" style="margin-top:14px" onclick="alert('AI result screen ready for backend model')">Analyse symptoms</button><p class="muted">Results should be treated as informational and not as a diagnosis.</p></div>`,"symptom-checker.html");
else if(path==="allergies.html")generic("Allergy Cross-check","SAFETY PROFILE",`<div class="tool"><div class="field"><label>Known allergy</label><input id="allergy" placeholder="e.g. Penicillin"></div><button class="btn" style="margin-top:14px" onclick="localStorage.setItem('allergy',allergy.value);alert('Allergy saved locally')">Save allergy</button><div class="warning" style="margin-top:15px"><b>Conflict warning area</b><p>When a medicine is searched, the backend will compare ingredients against this allergy profile.</p></div></div>`,"allergies.html");
else if(path==="my-profile.html")generic("My Profile","ACCOUNT",`<div class="ui-card"><div class="avatar">${esc(p.name[0].toUpperCase())}</div><h2>${esc(p.name)}</h2><p>${esc(p.email)}</p><a class="btn" href="settings.html">Settings →</a></div>`,"my-profile.html");
else if(path==="settings.html")generic("Settings","PREFERENCES",`<div class="rows"><a class="row" href="languages.html">文 <div class="grow"><b>Language</b><small>English, Hindi & regional languages</small></div><span>›</span></a><a class="row" href="reminders.html">⏰ <div class="grow"><b>Medicine Reminders</b><small>Manage your schedules</small></div><span>›</span></a><a class="row" href="allergies.html">⚠ <div class="grow"><b>Allergies & Safety</b><small>Manage known allergies</small></div><span>›</span></a><div class="row">🔔 <div class="grow"><b>Notifications</b><small>Medicine reminders</small></div><span class="tag">ON</span></div><div class="row">🌙 <div class="grow"><b>Appearance</b><small>Calm green theme</small></div><span class="tag">Light</span></div><div class="row">🔒 <div class="grow"><b>Privacy</b><small>Private health data</small></div><span class="tag">Protected</span></div><a class="row" href="my-profile.html">○ <div class="grow"><b>My Profile</b><small>Personal information</small></div><span>›</span></a></div>`,"settings.html")}
if(path==="home.html")home();else if(path==="ai-doctor-chatbot.html")aiDoctorChatbot();else if(path==="medicines.html")medicines();else if(path==="checker.html")checker();else if(path==="history.html")historyPage();else if(path==="patient-history.html")patient();else extras();