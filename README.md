# SQL Schema Graph

<p align="center">
  <strong>Visualize your SQL database schema as an interactive graph.</strong>
</p>

<p align="center">
  Turn complex SQL schemas into clear, interactive relationship diagrams — directly in your browser.
</p>

<p align="center">
  <a href="https://sql-schema-graph.vaibhav8145.workers.dev/">🚀 Live Demo</a>
  ·
  <a href="https://github.com/VaibhavGaikwadDev/sql-schema-graph">GitHub</a>
  ·
  <a href="https://github.com/VaibhavGaikwadDev/sql-schema-graph/issues">Report an Issue</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/VaibhavGaikwadDev/sql-schema-graph?style=for-the-badge" alt="GitHub Stars" />
  <img src="https://img.shields.io/github/forks/VaibhavGaikwadDev/sql-schema-graph?style=for-the-badge" alt="GitHub Forks" />
  <img src="https://img.shields.io/github/license/VaibhavGaikwadDev/sql-schema-graph?style=for-the-badge" alt="License" />
</p>

---

## ✨ Overview

**SQL Schema Graph** is a developer-focused tool for turning SQL database schemas into interactive visual diagrams.

Instead of navigating through tables and foreign-key definitions manually, you can visualize how your database is structured and how tables are connected.

Whether you're designing a new database, documenting an existing project, debugging relationships, or trying to understand an unfamiliar schema, SQL Schema Graph provides a visual way to explore it.

### 🚀 Try it now

**Live Demo:**
https://sql-schema-graph.vaibhav8145.workers.dev/

---

## 🎯 Why SQL Schema Graph?

Large database schemas can quickly become difficult to understand.

SQL Schema Graph helps you:

* 👀 Understand database structure visually
* 🔗 See relationships between tables
* 🧩 Identify primary and foreign keys
* 🗺️ Navigate complex schemas interactively
* 🔍 Explore tables without digging through SQL files
* 📚 Document database architecture
* ⚡ Quickly understand unfamiliar databases
* 🛠️ Use the visualization during development and debugging

---

## ✨ Features

### 🗄️ Schema Visualization

Transform your SQL schema into an interactive database graph.

Tables are represented as nodes, while relationships between tables are represented as connections.

### 🔗 Relationship Mapping

Visualize relationships between tables and understand how your database entities are connected.

### 🔍 Interactive Graph

Explore your schema using an interactive canvas.

* Zoom in
* Zoom out
* Fit the entire schema
* Pan around the graph
* Inspect relationships
* Navigate large schemas

### 📐 Automatic Layout

The graph automatically organizes database entities into a readable visual structure, making large schemas easier to explore.

### 🎨 Clean Developer-Focused UI

Designed with a minimal interface so the database structure remains the primary focus.

### ⚡ Browser-Based

No database installation is required to explore the visualization.

Open the application, provide your schema, and start exploring.

---

## 🖥️ Live Demo

Try SQL Schema Graph:

### 👉 [Open SQL Schema Graph](https://sql-schema-graph.vaibhav8145.workers.dev/)

---

## 🧑‍💻 Use Cases

SQL Schema Graph can be useful for:

### Database Design

Visualize a new schema before implementing or modifying it.

### Software Development

Understand relationships between entities while developing backend applications.

### Database Documentation

Generate a visual representation that can be used when documenting system architecture.

### Debugging

Identify unexpected or complicated table relationships.

### Codebase Onboarding

Help developers quickly understand the database structure of an existing project.

### Learning SQL

A visual representation can make relational database concepts easier to understand.

---

## 🛠️ Tech Stack

SQL Schema Graph is built using modern web technologies.

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| React               | User interface                  |
| TypeScript          | Type-safe development           |
| React Flow / XYFlow | Interactive graph visualization |
| Tailwind CSS        | Styling                         |
| shadcn/ui           | UI components                   |
| Vite                | Development and build tooling   |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm, pnpm, or yarn
* Git

### Clone the repository

```bash
git clone https://github.com/VaibhavGaikwadDev/sql-schema-graph.git
```

### Navigate to the project

```bash
cd sql-schema-graph
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The application will be available at the local development URL shown in your terminal.

---

## 📁 Project Structure

A simplified structure of the project:

```text
sql-schema-graph/
├── public/
├── src/
│   ├── components/
│   ├── ...
│   └── ...
├── package.json
├── tsconfig.json
├── vite.config.*
└── README.md
```

---

## 🔄 How It Works

The general workflow is:

```text
SQL Schema
    │
    ▼
Schema Parsing
    │
    ▼
Tables & Relationships
    │
    ▼
Graph Nodes & Edges
    │
    ▼
Interactive Visualization
```

The schema is interpreted into database entities and relationships, which are then represented as nodes and edges in the interactive graph.

---

## 🧩 Example

A relational schema such as:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

can be represented visually as:

```text
┌──────────────┐
│    users     │
├──────────────┤
│ PK id        │
│ name         │
└──────┬───────┘
       │
       │ user_id
       ▼
┌──────────────┐
│    orders    │
├──────────────┤
│ PK id        │
│ FK user_id   │
└──────────────┘
```

This becomes significantly more useful when working with dozens or hundreds of tables.

---

## 🤝 Contributing

Contributions are welcome.

If you have an idea for improving SQL Schema Graph:

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Test your changes
5. Commit your work

```bash
git commit -m "feat: add your feature"
```

6. Push your branch

```bash
git push origin feature/your-feature
```

7. Open a Pull Request

Please keep contributions focused and provide a clear description of the changes.

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea?

Please open an issue:

https://github.com/VaibhavGaikwadDev/sql-schema-graph/issues

When reporting a bug, include:

* What you expected to happen
* What actually happened
* Steps to reproduce the issue
* Relevant schema or example
* Browser/environment information when applicable

---

## ⭐ Support the Project

If SQL Schema Graph helps you understand, design, or document your database, consider giving the project a ⭐ on GitHub.

Your support helps the project reach more developers and encourages further development.

**Star the repository:**

https://github.com/VaibhavGaikwadDev/sql-schema-graph

---

## 📸 Screenshots

```md
<img width="1915" height="1031" alt="image" src="https://github.com/user-attachments/assets/6ad7d300-58e7-47ef-bd16-216d02eaf5fc" />
```

---

## 🗺️ Roadmap

Potential improvements include:

* [ ] More SQL dialect support
* [ ] Improved large-schema layouts
* [ ] Schema import/export
* [ ] More relationship visualization options
* [ ] Search and filtering
* [ ] Schema validation
* [ ] Export diagrams as images
* [ ] Export diagrams as documentation
* [ ] Improved mobile experience
* [ ] Additional database tooling

Have an idea?

Open an issue and start a discussion.

---

## 📄 License

This project is Open Source . You can use it as per your choice.

---

## 👨‍💻 Author

Created and maintained by **Vaibhav Gaikwad**.

GitHub:

https://github.com/VaibhavGaikwadDev

---

<p align="center">
  <strong>SQL Schema Graph</strong>
  <br />
  Visualize your database. Understand your architecture.
</p>

<p align="center">
  <a href="https://sql-schema-graph.vaibhav8145.workers.dev/">
    🚀 Open Live Demo
  </a>
</p>
