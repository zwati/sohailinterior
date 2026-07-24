# Graphify Usage & Installation Guide

This guide details how to update Graphify's system memory in this project and how to install and set up Graphify on new projects.

---

## 1. Updating Graphify in the Current Project

Whenever code files are modified, added, or deleted, run the following command in your terminal from the project root directory:

```bash
graphify update .
```
> **Or simply:**
> ```bash
> graphify update
> ```

### What `graphify update` Does:
* **AST-Only Code Re-extraction**: Quickly scans and parses code structure (JavaScript, Python, HTML, etc.) without requiring external API calls.
* **Refreshes Memory Artifacts**: Rebuilds the files inside `graphify-out/`:
  - `graphify-out/graph.json` (Knowledge Graph data)
  - `graphify-out/graph.html` (Interactive visual graph)
  - `graphify-out/GRAPH_REPORT.md` (Summary of communities and connected code nodes)

---

## 2. Installing Graphify on Other / New Projects

Follow these step-by-step instructions to set up Graphify on any new repository or project.

### Step 1: Install Graphify CLI
Ensure Python (3.9+) is installed on your system. Open terminal/PowerShell and install the `graphifyy` package:

```bash
pip install graphifyy
```

*(Optional: If you want semantic AI extraction support via Moonshot/Kimi, install with `pip install "graphifyy[kimi]"`)*

---

### Step 2: Initialize Graphify in New Project
Open terminal and navigate to the root directory of your new project:

```bash
cd path/to/your-new-project
```

Generate the initial graphify structure and system memory:

```bash
graphify update .
```

This creates the `graphify-out/` folder containing the graph database and report summaries for the project.

---

### Step 3: Register Graphify with AI Assistant Environment
To connect Graphify with your AI assistant environment so the AI can automatically leverage the knowledge graph:

* **For Google Antigravity:**
  ```bash
  graphify install antigravity
  ```

* **For Cursor IDE:**
  ```bash
  graphify install cursor
  ```

* **For Claude Code / Anthropic:**
  ```bash
  graphify install claude
  ```

* **For VS Code (Copilot Chat):**
  ```bash
  graphify install vscode
  ```

* **For Other AI Agents (AGENTS.md integrations):**
  ```bash
  graphify install codex
  ```

---

## 3. Useful Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Update code graph** | `graphify update .` |
| **Inspect graph nodes** | `graphify explain "functionName"` |
| **Shortest path between nodes** | `graphify path "nodeA" "nodeB"` |
| **Query graph with questions** | `graphify query "How does patient billing work?"` |
| **Check if graph needs update** | `graphify check-update .` |
