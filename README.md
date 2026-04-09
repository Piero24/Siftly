<div align="center">
  <img src="src/assets/logo.svg" alt="Siftly Logo" width="80" height="80">
  <h1>Siftly</h1>
  <p><b>Your Job Search Control Panel.</b></p>
  
  <p>
    <img src="https://img.shields.io/badge/version-1.0.2-blue?style=flat-square" alt="Version">
    <img src="https://img.shields.io/badge/license-Prosperity--3.0.0-green?style=flat-square" alt="License">
    <img src="https://img.shields.io/badge/tech-React%2019-61DAFB?style=flat-square&logo=react" alt="React">
    <img src="https://img.shields.io/badge/build-Vite-646CFF?style=flat-square&logo=vite" alt="Vite">
  </p>
</div>

---

###  The Vision

Siftly is a high-fidelity job application tracker designed to turn the chaotic search for your next role into a streamlined, data-driven experience. Built with a focus on **clean aesthetics** and **logical density**, it provides a command center for every interview, salary detail, and recruiter contact in your pipeline.

### ✨ Key Features

- **KPI Dashboard**: Instant insights into your application volume and interview conversion rates.

* **Interactive Timeline**: Manage your journey from _Initial Apply_ to _Signed Offer_ with a sleek, responsive interface.

- **Insight Cards**: Deep-dive modals for job details, interview rounds, and meeting links — optimized for both desktop and mobile.

* **Multi-Currency Support**: Real-time salary tracking with automatic conversion based on your local settings.

- **Privacy-Centric**: Secure data management powered by Supabase, ensuring your career data stays yours.

### 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Lucide Icons](https://lucide.dev/)
- **Styling**: Vanilla CSS with a custom Apple-inspired design system.
- **Backend**: [Supabase](https://supabase.com/) (Auth & Postgres)
- **Validation**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)

### 🚀 Getting Started

1. **Clone & Install**

   ```bash
   git clone https://github.com/Piero24/Siftly.git
   cd Siftly
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

3. **Launch the Dashboard**
   ```bash
   npm run dev:web
   ```

### 📦 Extension Build

Siftly is designed to work where you do. Build the Chrome extension with:

```bash
npm run build:extension
```

---

<div align="center">
  <sub>Built by <a href="https://github.com/Piero24">Piero</a> with ❤️ and a focus on visual excellence.</sub>
</div>
