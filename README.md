# 🚀 TaskMaster Pro (Crimson Edition)

> A modern, high-performance task management application featuring a **Vibrant Crimson & Sleek Charcoal** aesthetic, procedural Web Audio synthesizer, category chips, productivity streak tracking, and local JSON backup/restore.

---

## ✨ Features

### 🎨 Visual & Design Experience
- **Vibrant Crimson & Sleek Charcoal Palette**: High-contrast, balanced dark mode with glowing crimson accents and an ultra-clean light mode option.
- **Ambient Magma Backing**: Smooth, dynamic animated radial background blobs with a subtle technical mesh overlay.
- **Animated SVG Progress Ring**: Real-time visual tracking of your task completion percentage with crimson-to-ruby gradients.
- **Crimson Confetti Particles**: High-energy celebration particle burst on task completion.

### ⚡ Productivity & Organization
- **Smart Priority & Categories**: Color-coded badges for Priority (*High, Medium, Low*) and Categories (*💼 Work, 👤 Personal, ⚡ Urgent, ❤️ Health, 🧠 Learning*).
- **Interactive Category Filter Chips**: One-click filtering by specific tags with real-time counter updates.
- **Smart Due Date Tracking**: Automatic badge labeling for *Today*, *Tomorrow*, and urgent *Overdue* statuses.
- **Daily Streak Tracker**: Automatically calculates and tracks daily task completion streaks (`🔥 X day streak`).
- **Bulk Clear**: One-click action to remove all completed tasks.

### 🎵 Procedural Synth Sound Effects
- **Web Audio API**: Built-in sound synthesis for task creation, victory chimes on completion, deletions, and theme switching.
- **Mute Toggle**: Easily toggle audio on/off directly from the header (state saved to `localStorage`).

### 💾 Backup & Data Portability
- **Export Backup**: Download your entire mission list as a formatted JSON file with one click.
- **Import Backup**: Restore or merge tasks from any saved backup file.
- **100% Offline-Ready**: All tasks and user preferences persist locally via browser `localStorage`.

### ⌨️ Keyboard Shortcuts
- Press `/` anywhere to instantly focus the new task input field.
- Press `Escape` to close the edit modal or dismiss dialogs.

---

## 📁 Project Structure

```text
TO-DO LIST/
├── index.html     # Semantic HTML5 app structure, dashboard & modals
├── style.css      # CSS variables, glassmorphism, glowing accents & responsive layouts
├── script.js     # Modular ES6+ JavaScript, Web Audio synthesizer, confetti & state
└── README.md      # Project documentation & user guide
```

---

## 🚀 Quick Start / How to Run

1. **Direct Browser Execution**:
   - Double-click `index.html` or drag it into any modern web browser (Chrome, Edge, Firefox, Safari, Brave).
   
2. **Using a Local Development Server** (Optional):
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node npx serve
   npx serve .
   ```
   Open `http://localhost:8000` in your browser.

---

## 🛠️ Built With

- **HTML5**: Semantic tags, accessible ARIA labels, and SVG graphics.
- **Vanilla CSS3**: CSS Custom Properties (Variables), Flexbox, CSS Grid, Glassmorphism, and keyframe animations.
- **Modern JavaScript (ES6+)**: Modular class-based architecture, LocalStorage persistence, and FileReader API.
- **Web Audio API**: Procedural sound synthesis without external audio files.
- **Google Fonts**: [Outfit](https://fonts.google.com/specimen/Outfit) & [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans).

---

## 📝 License

Distributed under the MIT License. Feel free to customize and expand!
