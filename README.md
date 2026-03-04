# ⚡️ Voltix Marketplace

**Voltix** is a high-performance e-commerce platform built using a **Microfrontend Architecture**. It utilizes **Webpack 5 Module Federation** to allow independent teams to build, deploy, and scale different parts of the marketplace simultaneously.



## 🏗 Project Architecture

This project is managed as a **Monorepo** using npm workspaces, ensuring a unified development experience while maintaining strict separation of concerns:

* **Shell (Host):** The "orchestrator" of the marketplace. It handles global state, user authentication, navigation, and dynamically injects remote modules.
* **Catalog (Remote):** Responsible for product listings, search filters, and product detail pages.
* **Checkout (Remote):** (Planned) Handles the shopping cart, payment processing, and order confirmation.
* **Shared UI:** A shared library of design system components (buttons, inputs, modals) used across all microfrontends to ensure brand consistency.

## 🚀 Tech Stack

* **Frontend:** React 18, Webpack 5 (Module Federation), Babel.
* **Tooling:** Professional Monorepo setup with shared `node_modules`.
* **AI Integration:** OpenAI API for intelligent product recommendations and semantic search.

## 🛠 Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yuliacheketa/Voltix-Marketplace.git](https://github.com/yuliacheketa/Voltix-Marketplace.git)
   cd Voltix-Marketplace
