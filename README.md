<div align="center">

<br/>

```
╔══════════════════════════════════════════════════════════════╗
║           🔬 SCIENTIST ──── KNOWLEDGE ──── ENGINEER 🔧      ║
╚══════════════════════════════════════════════════════════════╝
Scientist-Engineer-Knowledge-Transfer-Graph
```

<br/>

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Maven](https://img.shields.io/badge/Maven-3.x-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)

<br/>

> **Visualize how scientific theories travel through time into engineering reality.**  
> Track knowledge transfer, detect innovation bottlenecks, and map the lag between discovery and implementation — through interactive bipartite graphs.

<br/>

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Backend Setup](#%EF%B8%8F-backend-setup-spring-boot)
- [Frontend Setup](#-frontend-setup-react--vite)
- [Running Full Stack](#-running-full-stack-locally)
- [Git Best Practices](#-git-best-practices)
- [Useful Commands](#-useful-commands)
- [Tips](#-tips)
- [Contributing](#-contributing)

---

## 🧠 Overview

The **Scientist–Engineer Knowledge Transfer Graph** is a full-stack data structure project that models the relationship between **scientific discoveries** and **engineering implementations** using **bipartite graphs**.

```
[Scientist Node] ──── transfer edge (lag: 73 yrs) ──── [Engineer Node]
      │                                                        │
  Alan Turing                                        IBM Quantum Team
  Niels Bohr                                         Deep Learning Eng.
  John von Neumann                                   Prototype Teams
```

Key capabilities:
- 🔗 **Bipartite Graph Visualization** — left: scientists, right: engineers
- ⏱️ **Lag Analysis** — calculate years between theory and implementation
- 🚨 **Bottleneck Detection** — flag high-lag knowledge transfers
- 📊 **Research-to-Product Dashboard** — full SIPOC pipeline view

---

## 📁 Project Structure

```
Scientist-Engineer-Knowledge-Transfer-Graph/
│
├── 📂 client/                          # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/                 # Reusable components (no ui/ subfolder)
│   │   │   ├── Navbar.tsx
│   │   │   ├── BipartiteGraph.tsx
│   │   │   ├── LagTable.tsx
│   │   │   ├── BottleneckAlert.tsx
│   │   │   ├── SipocTable.tsx
│   │   │   ├── EtvxPhase.tsx
│   │   │   └── StatCard.tsx
│   │   ├── pages/                      # Page-level route components
│   │   │   ├── HomePage.tsx
│   │   │   ├── GraphPage.tsx
│   │   │   ├── LagAnalysisPage.tsx
│   │   │   ├── BottleneckPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── 📂 server/                          # Spring Boot backend
│   ├── src/
│   │   └── main/java/...
│   ├── pom.xml
│   └── application.properties
│
└── 📄 README.md
```

---

## 🛠 Prerequisites

Before running this project, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| ☕ Java | 17+ | Spring Boot runtime |
| 🔨 Maven | 3.x | Backend build tool |
| 🟢 Node.js | 18+ | Frontend runtime |
| 📦 npm | 9+ | Package manager |
| 🐙 Git | Latest | Version control |

**Optional but recommended:**

- 🧩 **VS Code** or **IntelliJ IDEA** as your IDE
- 🔍 **React DevTools** browser extension
- 📮 **Postman** for testing REST APIs

---

## ⚙️ Backend Setup (Spring Boot)

### 1. Navigate to the server folder

```bash
cd server
```

### 2. Build the project

```bash
# Using Maven
mvn clean install
```

### 3. Run the Spring Boot server

```bash
mvn spring-boot:run
```

> ✅ Server starts at → **http://localhost:8080**

### 4. Verify it's running

Open `http://localhost:8080` in your browser — you should see a JSON response or the API root message.

---

## ⚡ Frontend Setup (React + Vite)

### 1. Navigate to the client folder

```bash
cd ../client
```

### 2. Install dependencies

```bash
# Using npm (recommended)
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

> ✅ Frontend starts at → **http://localhost:5173**

---

## 🔄 Running Full Stack Locally

Always start the **backend first**, then the **frontend**:

```bash
# Terminal 1 — Start backend
cd server
mvn spring-boot:run

# Terminal 2 — Start frontend
cd client
npm run dev
```

```
Browser → http://localhost:5173
             │
             └──── API calls ──── http://localhost:8080
```

---

## 📁 Git Best Practices

Add a `.gitignore` to avoid committing build artifacts:

```gitignore
# ── Spring Boot ──
/server/target/
/server/.idea/
/server/*.log

# ── React / Vite ──
/client/node_modules/
/client/dist/
/client/.env
/client/.env.local
```

**Normalize line endings on Windows:**

```bash
git config --global core.autocrlf true
```

---

## 🔧 Useful Commands

| Command | Location | Description |
|---------|----------|-------------|
| `mvn clean install` | `/server` | Build Spring Boot project |
| `mvn spring-boot:run` | `/server` | Run Spring Boot server |
| `npm install` | `/client` | Install frontend dependencies |
| `npm run dev` | `/client` | Start React + Vite dev server |
| `npm run build` | `/client` | Build frontend for production |
| `npm run preview` | `/client` | Preview production build |

---

## 📌 Tips

> 💡 **Start backend before frontend** to avoid API connection errors on load.

> 🔐 **Use `.env` files** for API base URLs — never hardcode `localhost:8080` in components.

```env
# client/.env
VITE_API_BASE_URL=http://localhost:8080
```

> 🚀 **For production**, build the frontend with `npm run build` and serve the `/dist` folder via Spring Boot static resources.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/your-username/Scientist-Engineer-Knowledge-Transfer-Graph.git

# 3. Create a feature branch
git checkout -b feature/awesome-feature

# 4. Make your changes and commit
git commit -m "✨ Add awesome feature"

# 5. Push to your branch
git push origin feature/awesome-feature

# 6. Open a Pull Request on GitHub
```

**Commit message conventions:**

| Prefix | Meaning |
|--------|---------|
| `✨ feat:` | New feature |
| `🐛 fix:` | Bug fix |
| `📝 docs:` | Documentation |
| `♻️ refactor:` | Code refactor |
| `🎨 style:` | UI/styling changes |

---

<div align="center">

<br/>

**Built for Advanced Data Structures · Spring Boot + React + TypeScript**

<br/>

*"The distance between theory and reality is measured in years — this tool measures it in graphs."*

</div>