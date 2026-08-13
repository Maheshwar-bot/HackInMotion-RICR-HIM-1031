const f=document.getElementById("authForm");

if(f) f.onsubmit=e=>{
  e.preventDefault();
  const msg=document.getElementById("msg");
  const path=location.pathname;

  if(path.includes("create-account")){
    const fullName=document.getElementById("name").value.trim();
    const email=document.getElementById("email").value.trim();
    const password=document.getElementById("password").value;
    const confirm=document.getElementById("confirm").value;

    if(!fullName || !email || !password || !confirm){
      msg.className="auth-message error";
      msg.textContent="Please complete your name, email and password.";
      return;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      msg.className="auth-message error";
      msg.textContent="Please enter a valid email address.";
      return;
    }
    if(password.length<6){
      msg.className="auth-message error";
      msg.textContent="Password must be at least 6 characters.";
      return;
    }
    if(password!==confirm){
      msg.className="auth-message error";
      msg.textContent="Passwords do not match.";
      return;
    }

    // OTP is reachable only after a valid email has been entered.
    localStorage.setItem("pending_signup",JSON.stringify({
      name:fullName,
      email,
      password,
      createdAt:Date.now()
    }));
    msg.className="auth-message success";
    msg.textContent="Email accepted. Opening verification…";
    setTimeout(()=>location.href="otp-verification.html",450);
    return;
  }

  if(path.includes("login")){
    const email=document.getElementById("email").value.trim();
    const password=document.getElementById("password").value;
    if(!email || !password){
      msg.className="auth-message error";
      msg.textContent="Please enter your email and password.";
      return;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      msg.className="auth-message error";
      msg.textContent="Please enter a valid email address.";
      return;
    }
    localStorage.setItem("profile",JSON.stringify({name:email.split("@")[0],email}));
    localStorage.setItem("medisafe_verified","1");
    msg.className="auth-message success";
    msg.textContent="Login successful. Opening MediSafe…";
    setTimeout(()=>location.href="home.html",400);
    return;
  }

  if(path.includes("forgot")){
    msg.textContent="Reset request created. Connect your auth provider for real email delivery.";
  }
};

const otpForm=document.getElementById("otpForm");

if(otpForm){
  const pending=JSON.parse(localStorage.getItem("pending_signup")||"null");

  // Do not allow a user to open the OTP screen without first entering an email.
  if(!pending || !pending.email){
    location.replace("create-account.html");
  }else{
    const target=document.getElementById("otpTarget");
    if(target) target.textContent=`We sent a 6-digit verification code to ${pending.email}.`;

    otpForm.onsubmit=e=>{
      e.preventDefault();
      const msg=document.getElementById("msg");
      const otp=document.getElementById("otp").value.trim();

      if(!/^\d{6}$/.test(otp)){
        msg.className="auth-message error";
        msg.textContent="Enter the 6-digit OTP.";
        return;
      }

      // Frontend demo OTP. Production: replace with Supabase/Auth provider verification.
      if(otp!=="123456"){
        msg.className="auth-message error";
        msg.textContent="Invalid OTP. For this frontend demo use 123456.";
        return;
      }

      localStorage.setItem("profile",JSON.stringify({
        name:pending.name,
        email:pending.email
      }));
      localStorage.setItem("medisafe_verified","1");
      localStorage.removeItem("pending_signup");
      msg.className="auth-message success";
      msg.textContent="Email verified! Your account is ready.";
      setTimeout(()=>location.href="home.html",500);
    };
  }
}
