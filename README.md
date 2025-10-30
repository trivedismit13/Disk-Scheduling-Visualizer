# 🧠 Disk Scheduling Visualizer (SCAN & C-SCAN Algorithms)

## 🔹 Overview
The **Disk Scheduling Visualizer** is an interactive web application built using **HTML, CSS, and JavaScript** to simulate disk head movement for popular scheduling algorithms — **SCAN** and **C-SCAN**.  
It helps users visualize how each algorithm services I/O requests, calculates seek time, and optimizes head movement.

---

## ⚙️ Features
- 🎛️ **Interactive Input Panel** – Set disk size, head start position, request sequence, and direction.  
- 💫 **Real-Time Animation** – Smooth neon-themed visualization of head movement across cylinders.  
- 🔁 **Dual Algorithm Support** – Implements SCAN (Elevator) and C-SCAN scheduling.  
- 📈 **Metrics Calculation** – Shows total head movement, average seek time, and waiting movement.  
- 📤 **Export Options** – Save simulation trace or export results as a screenshot.  
- 🧱 **Responsive UI** – Works smoothly across desktop browsers.

---

## 🧩 Tech Stack

| Component | Technology Used |
|------------|----------------|
| **Frontend** | HTML5, CSS3 (Carbon Neon theme), JavaScript (ES6) |
| **Animation** | Canvas + Frame-by-frame rendering |
| **Algorithms** | SCAN & C-SCAN implemented in modular JS |
| **Code Style** | Modular, fully commented, separated by logic and UI layers |

---

## 🗂️ Project Structure

📁 Disk-Scheduling-Visualizer/<br>
│<br>
├── 📁 src/<br>
│ ├── index.html → Main interface<br>
│ ├── style.css → Carbon Neon dark theme styling<br>
│ ├── script.js → App control logic and event binding<br>
│ ├── ui.js → Input handling, control panel<br>
│ ├── animation.js → Head movement animation logic<br>
│ ├── algorithms.js → SCAN & C-SCAN implementations + metrics<br>
│<br>
├── 📄 README.md → Project documentation (this file)<br>
└── 📁 assets/ → Screenshots or icons (optional)<br>


---

## 🧮 Algorithms Implemented

### 1. SCAN (Elevator Algorithm)
- Services requests in one direction until the end of the disk.  
- Then reverses direction and continues servicing remaining requests.

### 2. C-SCAN (Circular SCAN)
- Services requests only in one direction.  
- When it reaches the end, it jumps back to the start and continues.

---

## 📊 Output Metrics
- **Total Head Movement (THM)** – Total distance moved by the head.  
- **Average Seek Time** – THM ÷ number of requests.  
- **Per-Request Waiting Movement** – Movement till each request is served.  
- **Trace Visualization** – Sequence of head positions.

---

## 🎨 Animation Guide

| Element | Color | Meaning |
|----------|--------|---------|
| 🟢 Green Line | — | Head movement path |
| 🔵 Blue Dots | — | Request locations |
| 🟠 Orange Dot | — | Active request being serviced |
| 🔴 Red Dot | — | Current head position |

---

## 💻 How to Run Locally

1. **Download or clone the repository:**<br>
   ```bash<br>
   git clone https://github.com/<your-username>/Disk-Scheduling-Visualizer.git<br>
2.Open the folder and locate:<br>

src/index.html<br>


3.Run the project:<br>

Double-click index.html, or<br>

Right-click → Open with Browser (Chrome / Edge / Firefox)<br>

✅ No additional setup or dependencies required.<br>

🌐 Browser Requirements<br>

Browser	Minimum Version
Google Chrome	90+
Microsoft Edge	90+
Mozilla Firefox	88+


🧾 Author<br>

Name: Smit [Your Full Name if required by VTOP]<br>
Course: B.Tech CSE<br>
Project Title: Disk Scheduling Visualizer<br>
Year: 2025