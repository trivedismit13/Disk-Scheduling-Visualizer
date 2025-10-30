🧠 Disk Scheduling Visualizer (SCAN & C-SCAN Algorithms)


🔹 Overview

The Disk Scheduling Visualizer is an interactive web application built using HTML, CSS, and JavaScript to simulate disk head movement for popular scheduling algorithms — SCAN and C-SCAN.
It helps users visualize how each algorithm services I/O requests, calculates seek time, and optimizes head movement.



⚙️ Features

Interactive Input Panel – Set disk size, head start position, request sequence, and direction.

Real-Time Animation – Smooth neon-themed visualization of head movement across cylinders.

Dual Algorithm Support – Implements SCAN (Elevator) and C-SCAN scheduling.

Metrics Calculation – Shows total head movement, average seek time, and waiting movement.

Export Options – Save simulation trace or export results as screenshot.

Responsive UI – Works smoothly across desktop browsers.



🧩 Tech Stack
Component	Technology Used
Frontend	HTML5, CSS3 (Carbon Neon theme), JavaScript (ES6)
Animation	Canvas + Frame-by-frame rendering
Algorithms	SCAN & C-SCAN implemented in modular JS
Code Style	Modular, fully commented, separated by logic and UI layers


🗂️ Project Structure
📁 Disk-Scheduling-Visualizer/
│
├── 📁 src/
│   ├── index.html         → Main interface
│   ├── style.css          → Carbon Neon dark theme styling
│   ├── script.js          → App control logic and event binding
│   ├── ui.js              → Input handling, control panel
│   ├── animation.js       → Head movement animation logic
│   ├── algorithms.js      → SCAN & C-SCAN implementations + metrics
│
├── 📄 README.md            → Project documentation (this file)




🧮 Algorithms Implemented
1. SCAN (Elevator Algorithm)

Services requests in one direction until the end of disk.

Then reverses direction and continues servicing remaining requests.

2. C-SCAN (Circular SCAN)

Services requests only in one direction.

When it reaches the end, it jumps back to the start and continues.



📊 Output Metrics

Total Head Movement (THM) – Total distance moved by the head.

Average Seek Time – THM ÷ number of requests.

Per-Request Waiting Movement – Movement till each request is served.

Trace Visualization – Sequence of head positions.

🎨 Animation Guide
Element	Color	Meaning
🟢 Green Line	Head movement path	
🔵 Blue Dots	Request locations	
🟠 Orange Dot	Active request being serviced	
🔴 Red Dot	Current head position	



💻 How to Run Locally

Download or clone the repository:

git clone https://github.com/trivedismit13/Disk-Scheduling-Visualizer.git


Open the folder and locate:

src/index.html


Double-click or open with any modern browser (Chrome, Edge, Firefox).
(No additional setup or dependencies required.)


🌐 Browser Requirements
Browser	Minimum Version
Google Chrome	90+
Microsoft Edge	90+
Mozilla Firefox	88+


🧾 Author

Name: Smit [Your Full Name if required by VTOP]
Course: B.Tech CSE
Project Title: Disk Scheduling Visualizer
Year: 2025