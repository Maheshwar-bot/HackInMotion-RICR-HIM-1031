# MediSafe AI — Professional Frontend Prototype

## Pages
- Landing
- Login
- Create Account
- Forgot Password
- Home dashboard
- Medicine library / search
- Interaction checker
- Check history
- Patient history / notes
- My profile
- Settings

## Folder structure
```text
MediSafe-AI-Professional/
├── index.html
├── pages/
├── css/
├── js/
├── assets/
│   └── images/
│       └── medisafe-login-bg.png   # uploaded reference image
└── data/
```

## Run
1. Extract the ZIP.
2. Open `index.html` in a browser.
3. For best results, run a local server in VS Code (Live Server) instead of opening files directly.

## What is live in this prototype
- Responsive UI
- Page-to-page navigation
- Login/create-account demo flow
- Password visibility toggle
- Local profile storage
- Add medicine to local cabinet
- Medicine search/filter
- Interaction checker with demo dataset
- Check history saved in localStorage
- Patient notes saved locally
- Profile editing
- Settings toggles
- Mobile sidebar + bottom navigation
- Toast notifications

## Production connection
The frontend currently uses localStorage/sessionStorage so it works without a backend.
For production:
- Supabase Auth for real login/signup/password reset
- Supabase PostgreSQL for users, medicines, checks and patient records
- Secure backend/API for medicine data and interaction logic
- Never expose service-role keys in browser JavaScript
- Use Row Level Security (RLS) for patient data

## Important
The interaction checker is a UI/demo dataset, not a clinical decision system. Verify medicine information using an authoritative source and a qualified healthcare professional before making health decisions.
