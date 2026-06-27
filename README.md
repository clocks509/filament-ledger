# 🧵 The Filament Ledger

A React‑based filament inventory tracker for 3D printing. Manage spools, track remaining filament, log print usage, get refill alerts, and create a shopping list.

🔗 **Live demo:** [filament-ledger-vk1k.vercel.app](https://filament-ledger-vk1k.vercel.app)

---

## ✨ Features

- **Spool management** – add, edit, and delete spools with brand, material, colour, and weight.
- **AMS support** – assign spools to AMS slots (1–4) and see them in a visual dashboard.
- **Print logging** – deduct exact grams used per print, with optional print name.
- **Weigh spool** – update remaining weight by entering gross weight; app calculates net filament.
- **Shopping list** – auto‑generated from empty and low spools, with one‑tap copy.
- **Global history** – chronological log of all events (prints, weigh‑ins, updates).
- **Steampunk theme** – beautiful vintage design with gears, rivets, and pressure gauges.
- **Responsive** – works on desktop and mobile; install as a web app on your phone.
- **RFID reader support** – optional USB‑C keyboard‑emulation readers. Scan tags to quickly add or identify spools.
- **Brand‑specific tare overrides** – save empty spool weights per brand for one‑click tare entry.
- **Custom spool support** – log 3D‑printed or generic spools with custom tares.
- **Decimal precision** – weigh with exact decimals (e.g., 847.3g) for accurate tracking.

---

## 📡 RFID Reader Integration (Optional)

You don't need an RFID reader to use this app – you can manage everything manually. But if you have one, scanning tags makes adding and identifying spools much faster.

### ✅ Supported readers
- USB‑C **keyboard‑emulation** readers (most common)
- Supports **ISO14443-A** and **ISO15693** tags (used by Bambu Lab spools and many others)
- Example: **VOTAN NF‑C** (the reader used during development)

### 📱 How to use it

1. Plug the reader into your computer or phone's USB‑C port.
2. Tap a tag on the reader – the UID automatically appears in the scanner field.
3. If the tag is **new**, the app opens the "Add Spool" form with the UID pre‑filled.
4. If the tag is **already linked** to a spool, the app shows you the spool details and offers quick actions (weigh, mark refill, edit).

### 🔧 No reader? No problem
You can still:
- Manually type a tag ID (or leave the field blank).
- Add spools using the `+` button.
- Use the app completely without a reader.

---

## 🛠️ Tech Stack

- **React** (with Hooks)
- **Vite** – fast build tool
- **Tailwind CSS** – utility‑first styling
- **Lucide React** – icons
- **Vercel** – hosting

---

## 📱 Run it locally

```bash
# Clone the repository
git clone https://github.com/clocks509/filament-ledger.git

# Navigate into the project folder
cd filament-ledger

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deploy to Vercel

1. Fork this repository.
2. Create a new project on [Vercel](https://vercel.com) and import your fork.
3. Vercel will automatically detect Vite and deploy.

---

## 🤝 How to Contribute

Thank you for your interest in The Filament Ledger! Every suggestion helps.

### 🐛 Found a bug or have an idea?

1. Open an **Issue** – go to the **"Issues"** tab and describe what you'd like to see changed or fixed.
2. I'll reply and we can discuss it.

### 💻 Want to submit code?

1. **Fork** this repository.
2. Make your changes in your fork.
3. Open a **Pull Request** – describe what you changed and why.
4. I'll review it, suggest changes if needed, and merge it if it fits the project.

### 🙋‍♂️ Don't know how to code?

That's fine! You can still help:
- Open an **Issue** with a feature request.
- Share the app with other makers.
- Tell me what you'd like to see improved.

---

## 💬 Feedback & Ideas

I'd love to hear what you think! If you have an idea for a new feature, a suggestion, or just want to say hi:

- Open an **Issue** – it's the easiest way to start a conversation.
- You don't need to be a developer – your ideas are just as valuable.

---

## 🙏 Acknowledgements

This project was built with assistance from AI tools (Claude and DeepSeek) under the direct supervision and direction of [clocks509](https://github.com/clocks509). All design decisions, feature requests, bug fixes, and project structure were determined by the author.

---

## 🙋‍♂️ About

Built by [clocks509](https://github.com/clocks509) – a 3D printing enthusiast who wanted a better way to track filament.

**If you find this useful, give it a ⭐ on GitHub!**
