const API_BASE_URL = "http://localhost:5000";


// =============================================================
// COMMON HELPERS
// =============================================================

const saveAuthenticatedUser = (data, fallbackEmail = "") => {
  if (!data || !data.token) {
    throw new Error("Authentication token was not received.");
  }

  localStorage.setItem("token", data.token);

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));

    localStorage.setItem(
      "profile",
      JSON.stringify({
        name: data.user.name || fallbackEmail.split("@")[0],
        email: data.user.email || fallbackEmail,
        id: data.user.id || data.user._id || null,
        profileImage: data.user.profileImage || "",
      })
    );
  }

  localStorage.setItem("medisafe_verified", "1");
};


const loginAfterSignupVerification = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Account created, but automatic login failed."
    );
  }

  saveAuthenticatedUser(data, email);

  return data;
};


// =============================================================
// CREATE ACCOUNT + LOGIN
// =============================================================

const f = document.getElementById("authForm");

if (f) {
  f.onsubmit = async (e) => {
    e.preventDefault();

    const msg = document.getElementById("msg");
    const path = location.pathname;


    // =========================================================
    // SIGNUP
    // =========================================================

    if (path.includes("create-account")) {
      const fullName = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirm = document.getElementById("confirm").value;

      // Required fields
      if (!fullName || !email || !password || !confirm) {
        msg.className = "auth-message error";
        msg.textContent =
          "Please complete your name, email and password.";
        return;
      }

      // Email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.className = "auth-message error";
        msg.textContent = "Please enter a valid email address.";
        return;
      }

      // Backend requires minimum 8 characters
      if (password.length < 8) {
        msg.className = "auth-message error";
        msg.textContent =
          "Password must be at least 8 characters.";
        return;
      }

      // Password confirmation
      if (password !== confirm) {
        msg.className = "auth-message error";
        msg.textContent = "Passwords do not match.";
        return;
      }

      const submitButton = f.querySelector(
        'button[type="submit"]'
      );

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText =
          submitButton.innerHTML;
        submitButton.innerHTML = "Sending OTP...";
      }

      msg.className = "auth-message";
      msg.textContent = "Creating your account...";


      try {
        // -------------------------------------------------------
        // Backend signup
        // POST /api/auth/signup
        // -------------------------------------------------------

        const response = await fetch(
          `${API_BASE_URL}/api/auth/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: fullName,
              email,
              password,
              confirmPassword: confirm,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to create account."
          );
        }

        // -------------------------------------------------------
        // Store temporary signup information only until OTP
        // verification is completed.
        // -------------------------------------------------------

        localStorage.setItem(
          "pending_signup",
          JSON.stringify({
            name: fullName,
            email: data.email || email,
            password,
            createdAt: Date.now(),
          })
        );

        msg.className = "auth-message success";
        msg.textContent =
          data.message ||
          "OTP sent successfully. Opening verification...";

        setTimeout(() => {
          location.href = "otp-verification.html";
        }, 500);

      } catch (error) {
        console.error("Signup error:", error);

        msg.className = "auth-message error";

        if (
          error instanceof TypeError &&
          error.message.includes("fetch")
        ) {
          msg.textContent =
            "Unable to connect to the server. Please make sure the MediMitra backend is running.";
        } else {
          msg.textContent =
            error.message ||
            "Signup failed. Please try again.";
        }

      } finally {
        if (submitButton) {
          submitButton.disabled = false;

          if (submitButton.dataset.originalText) {
            submitButton.innerHTML =
              submitButton.dataset.originalText;
          }
        }
      }

      return;
    }


    // =========================================================
    // LOGIN
    // =========================================================

    if (path.includes("login")) {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        msg.className = "auth-message error";
        msg.textContent =
          "Please enter your email and password.";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.className = "auth-message error";
        msg.textContent =
          "Please enter a valid email address.";
        return;
      }

      const submitButton = f.querySelector(
        'button[type="submit"]'
      );

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText =
          submitButton.innerHTML;
        submitButton.innerHTML = "Logging in...";
      }

      msg.className = "auth-message";
      msg.textContent = "Logging in...";


      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "Invalid email or password."
          );
        }

        saveAuthenticatedUser(data, email);

        msg.className = "auth-message success";
        msg.textContent =
          "Login successful. Opening MediSafe...";

        setTimeout(() => {
          location.href = "home.html";
        }, 400);

      } catch (error) {
        console.error("Login error:", error);

        msg.className = "auth-message error";

        if (
          error instanceof TypeError &&
          error.message.includes("fetch")
        ) {
          msg.textContent =
            "Unable to connect to the server. Please make sure the MediMitra backend is running.";
        } else {
          msg.textContent =
            error.message ||
            "Login failed. Please try again.";
        }

      } finally {
        if (submitButton) {
          submitButton.disabled = false;

          if (submitButton.dataset.originalText) {
            submitButton.innerHTML =
              submitButton.dataset.originalText;
          }
        }
      }

      return;
    }


    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    if (path.includes("forgot")) {
      msg.textContent =
        "Reset request created. Connect your auth provider for real email delivery.";
    }
  };
}


// =============================================================
// OTP VERIFICATION
// =============================================================

const otpForm = document.getElementById("otpForm");

if (otpForm) {
  const pending = JSON.parse(
    localStorage.getItem("pending_signup") || "null"
  );

  // User cannot access OTP page without starting signup
  if (!pending || !pending.email || !pending.password) {
    location.replace("create-account.html");
  } else {
    const target = document.getElementById("otpTarget");

    if (target) {
      target.textContent =
        `We sent a 6-digit verification code to ${pending.email}.`;
    }


    // =========================================================
    // VERIFY OTP
    // =========================================================

    otpForm.onsubmit = async (e) => {
      e.preventDefault();

      const msg = document.getElementById("msg");
      const otp = document
        .getElementById("otp")
        .value
        .trim();

      if (!/^\d{6}$/.test(otp)) {
        msg.className = "auth-message error";
        msg.textContent =
          "Enter the 6-digit OTP.";
        return;
      }

      const submitButton = otpForm.querySelector(
        'button[type="submit"]'
      );

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText =
          submitButton.innerHTML;
        submitButton.innerHTML =
          "Verifying...";
      }

      msg.className = "auth-message";
      msg.textContent = "Verifying your email...";


      try {
        // -------------------------------------------------------
        // Backend OTP verification
        // POST /api/auth/verify-signup-otp
        // -------------------------------------------------------

        const response = await fetch(
          `${API_BASE_URL}/api/auth/verify-signup-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: pending.email,
              otp,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "OTP verification failed."
          );
        }

        msg.className = "auth-message success";
        msg.textContent =
          data.message ||
          "Email verified successfully. Logging you in...";


        // -------------------------------------------------------
        // Backend verification creates the account but does not
        // return a JWT.
        //
        // Therefore we login immediately using the same credentials
        // that were entered during signup.
        // -------------------------------------------------------

        await loginAfterSignupVerification(
          pending.email,
          pending.password
        );

        // Remove temporary signup data
        localStorage.removeItem("pending_signup");

        msg.textContent =
          "Account created successfully. Opening MediSafe...";

        setTimeout(() => {
          location.href = "home.html";
        }, 500);

      } catch (error) {
        console.error(
          "Signup OTP verification error:",
          error
        );

        msg.className = "auth-message error";

        if (
          error instanceof TypeError &&
          error.message.includes("fetch")
        ) {
          msg.textContent =
            "Unable to connect to the server. Please make sure the MediMitra backend is running.";
        } else {
          msg.textContent =
            error.message ||
            "OTP verification failed. Please try again.";
        }

      } finally {
        if (submitButton) {
          submitButton.disabled = false;

          if (submitButton.dataset.originalText) {
            submitButton.innerHTML =
              submitButton.dataset.originalText;
          }
        }
      }
    };


    // =========================================================
    // RESEND SIGNUP OTP
    // =========================================================

    const resendButton = document.querySelector(
      ".text-btn"
    );

    if (resendButton) {
      resendButton.onclick = async () => {
        const msg = document.getElementById("msg");

        resendButton.disabled = true;
        msg.className = "auth-message";
        msg.textContent = "Sending a new OTP...";

        try {
          const response = await fetch(
            `${API_BASE_URL}/api/auth/resend-signup-otp`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: pending.email,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(
              data.message ||
              "Unable to resend OTP."
            );
          }

          msg.className = "auth-message success";
          msg.textContent =
            data.message ||
            "New OTP sent successfully.";

        } catch (error) {
          console.error(
            "Resend signup OTP error:",
            error
          );

          msg.className = "auth-message error";
          msg.textContent =
            error.message ||
            "Unable to resend OTP.";

        } finally {
          resendButton.disabled = false;
        }
      };
    }
  }
}