# 🎬 MovieMate — Smart Movie Watchlist & Discovery App

> A sleek, full-stack movie tracker that lets users search, organize, and rate movies from TMDB — with a smooth, responsive UI and persistent local storage. Designed for cinephiles who love simplicity, speed, and style.

![MovieMate Preview](https://source.unsplash.com/featured/?movie,cinema) <!-- Replace with actual screenshot -->

---

## ✨ Why MovieMate?

Managing your movie watchlist shouldn't feel like a chore. **MovieMate** offers a frictionless experience to search for films, track what you've seen, and curate your personal favorites — all in a modern web UI, no login required.

---

## 💡 Core Features

- 🔍 **Search Any Movie** — Powered by TMDB API
- ✅ **Add to Watched / To Watch** — Track what you’ve seen or plan to
- ⭐ **Custom Ratings** — Rate movies after watching
- 🧠 **Average Rating Insights** — Compare your ratings vs global scores
- 📱 **Fully Responsive** — Works on all devices
- ⚡ **Fast UX** — Minimal loading time, optimized queries
- 🧩 **Modular Components** — Clean, reusable React logic

---

## 🧰 Tech Stack

| Layer      | Technology                 |
|------------|-----------------------------|
| Frontend   | React + Vite               |
| State      | React Hooks (`useReducer`) |
| Styling    | CSS Modules                |
| API        | TMDB (The Movie DB)        |
| Storage    | LocalStorage (watchlist)   |
| Build Tool | Vite                       |

---

## 🧠 Architecture Notes

- `App.jsx` — main routing + state initialization  
- `Search.jsx` — TMDB query logic + debounce UX  
- `MovieList.jsx` — dynamic rendering of results  
- `WatchedSummary.jsx` — aggregates your stats  
- `WatchedList.jsx` — renders your saved movies with custom rating  
- `useMovies()` — custom hook for fetching and managing API state  
- `useLocalStorageState()` — syncs watchlist to browser storage  

> Architecture follows **unidirectional data flow**, optimized for **predictable state transitions** using `useReducer`.

---

## 📂 File Structure

```bash
moviemate/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── MovieList.jsx
│   │   ├── WatchedList.jsx
│   │   ├── WatchedSummary.jsx
│   │   ├── Search.jsx
│   │   └── Rating.jsx
│   ├── hooks/
│   │   ├── useMovies.js
│   │   └── useLocalStorageState.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── README.md
````

---

## 🚀 Getting Started

1. Clone the repository

```bash
git clone https://github.com/your-username/moviemate.git
cd moviemate
npm install
npm run dev
```

2. Add your TMDB API Key

Create a `.env` file in the root:

```env
VITE_TMDB_KEY=your_api_key_here
```

3. Launch in your browser
   Visit [http://localhost:5173](http://localhost:5173)

---

## 🧪 Demo

Try the [Live Demo](https://your-live-demo-link.com) 🚀

---

## 📈 Possible Improvements

* 📝 User reviews & notes per movie
* 📦 Backend persistence with Supabase or Firebase
* 🧑‍🤝‍🧑 Social sharing / friend watchlists
* 📊 Visual analytics dashboard (genres, runtimes, etc.)
* 🎯 Recommendation engine using TMDB similar titles

---

## 📄 License

MIT — [View License](LICENSE)

---

## 👤 Author

**Youssef Abd**
Developer passionate about beautiful, performant interfaces.
[GitHub](https://github.com/YOUR_USERNAME) • [LinkedIn](#) • [Portfolio](#)
