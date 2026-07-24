# Graphify Integration Rules & Agent Guidelines

## System Memory & Knowledge Graph (Graphify)

This workspace uses **Graphify** (`graphifyy`) for codebase structure parsing and knowledge graph memory.

### Key Workflows:

1. **Graph Maintenance**:
   - Whenever code files (e.g. `server.js`, client JS, HTML, configs) are created, modified, or deleted, run:
     ```bash
     graphify update .
     ```
   - This re-extracts code structure AST and updates `graphify-out/graph.json`, `graphify-out/graph.html`, and `graphify-out/GRAPH_REPORT.md`.

2. **Querying Code Architecture**:
   - To inspect specific symbols/nodes: `graphify explain "<symbol_or_function>"`
   - To query the codebase graph: `graphify query "<question>"`
   - To trace relationships between nodes: `graphify path "<nodeA>" "<nodeB>"`

3. **New Project Setup**:
   - Refer to `GRAPHIFY_GUIDE.md` for full installation (`pip install graphifyy`), initialization (`graphify update .`), and agent registration (`graphify install antigravity`).
