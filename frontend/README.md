# 🎨 Concept Art Web – Frontend

Frontend application built with:

- ⚛️ React
- ⚡ Vite
- 🎨 Tailwind CSS v4 (Zero Config Setup)

This project is part of the Concept Art Web platform, designed for showcasing game concept art and supporting collaboration between artists and developers.

---

# 🚀 Getting Started

## 1️⃣ Install Dependencies

```bash
npm install
```

If Tailwind is not installed yet:

```bash
npm install -D tailwindcss @tailwindcss/postcss autoprefixer
```

---

# ⚙️ Tailwind CSS v4 Setup

This project uses **Tailwind CSS v4 zero-config approach**.

Unlike Tailwind v3:

- ❌ No `tailwind.config.js` required
- ❌ No `@tailwind base/components/utilities`
- ✅ Uses `@import "tailwindcss";`
- ✅ Uses `@tailwindcss/postcss`

---

## 📁 PostCSS Configuration

`postcss.config.js`

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
}
```

---

## 🎨 CSS Setup

`src/index.css`

```css
@import "tailwindcss";
```

⚠️ Important:
Do NOT use the Tailwind v3 syntax:

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

# ▶️ Run Development Server

```bash
npm run dev
```

Default local URL:

```
http://localhost:5173
```

---

# ✅ Testing Tailwind Installation

Temporarily replace `App.jsx` with:

```jsx
export default function App() {
  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <h1 className="text-yellow-400 text-5xl font-bold">
        Tailwind v4 Working 🚀
      </h1>
    </div>
  )
}
```

If the background appears black and the text yellow → Tailwind is working correctly.

---

# 🛠 Troubleshooting

If styles are not applied:

✔ Ensure `main.jsx` imports `index.css`

```js
import "./index.css";
```

✔ Restart dev server after installation

✔ Ensure no conflicting `App.css` is overriding styles

✔ Node version must be ≥ 18

Check version:

```bash
node -v
```

---

# 📦 Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# 📁 Suggested Project Structure

```
src/
 ├── assets/
 ├── components/
 ├── pages/
 ├── layouts/
 ├── index.css
 ├── main.jsx
 └── App.jsx
```

---

# 🔥 Notes

Tailwind v4 introduces a simplified architecture and improved performance.  
This project intentionally uses the zero-config setup for cleaner integration with Vite.

For long-term production scaling, a custom Tailwind configuration file can still be added if needed.

---

# 👨‍💻 Author

Frontend developed as part of Software Engineering final project (Skripsi).

---

If you encounter issues, ensure dependencies are correctly installed and the dev server is restarted after configuration changes.

