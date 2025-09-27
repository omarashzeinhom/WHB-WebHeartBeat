# 🌐 WHB - Web Heartbeat Monitoring Dashboard

A professional-grade website monitoring tool that puts you in control of your data thats embraces the "local-first, encrypted, sync-anywhere" model. This is what modern, privacy-focused users want.

## 🚀 Overview

Web Heartbeat is a comprehensive web vitals monitoring application designed to track performance, security, and uptime for **150+ websites**. Built with privacy-first principles, your data stays locally stored unless you choose to sync it.

> **Your data, your rules** - No telemetry, no sneaky data collection, just pure monitoring functionality

## 🎯 Getting Started

### Prerequisites

- **IDE**: VS Code with [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) and [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) extensions
- **Node.js** (v18 or higher)
- **Rust** (latest stable)

### Installation & Development

1. **Clone and install dependencies**

```bash
yarn install
```

2. **Start development servers**

```bash
# Frontend (Vite)
yarn dev

# Backend (Tauri) - Build first then run
yarn tauri build
yarn tauri dev
```

## 📁 Project Structure

### 🔧 Backend (Rust)

```
src-tauri/
├── src/
│   ├── main.rs              # Application entry point
│   ├── models/              # Data structures
│   │   ├── mod.rs
│   │   ├── website.rs       # Website model
│   │   └── web_vitals.rs    # Performance metrics
│   ├── controllers/         # Request handlers
│   │   ├── mod.rs
│   │   ├── website_controller.rs
│   │   └── screenshot_controller.rs
│   └── services/           # Business logic & external integrations
│       ├── mod.rs
│       ├── storage_service.rs      # Local storage management
│       └── back4app_service.rs     # BaaS integration
├── Cargo.toml              # Rust dependencies
└── tauri.conf.json        # Tauri configuration
```

### 🎨 Frontend (TypeScript + React)

```
src/
├── main.tsx               # React entry point
├── App.tsx               # Root component
├── models/               # TypeScript interfaces
│   ├── Website.ts
│   └── WebVitals.ts
├── controllers/          # Frontend controllers
│   └── WebsiteController.ts
├── components/           # UI components
│   ├── WebsiteCard/      # Individual website display
│   │   ├── WebsiteCard.tsx
│   │   └── WebsiteCard.css
│   └── AddWebsiteForm/   # Website addition interface
│       ├── AddWebsiteForm.tsx
│       └── AddWebsiteForm.css
├── services/             # API communication
│   └── TauriService.ts   # Bridge to Rust backend
└── styles/               # Global styles
    └── App.css
```

## 💾 Storage Options

### On First Launch

When you start WHB, you'll choose how to store your data:

1. **📱 Local Only (Free)** - Data stays securely on your device
2. **🔌 Connect Existing Backend (Free)** - Integrate with your existing BaaS solution
3. **☁️ Premium Cloud (Paid)** - Our hosted solution with automatic backups

### Future Cloud Integration Options

We're planning to implement these cloud save options:

**🧩 User-Selected Cloud Storage** (Privacy-First Approach)

- Save to Google Drive, Dropbox, or OneDrive using your own accounts
- Zero data access from our side - we never see your credentials
- Implementation via OAuth + official SDKs

*Pros*: Maximum privacy, no backend required, uses existing cloud accounts  
*Cons*: Requires integration work, depends on user having cloud accounts

## 🛠️ Technologies Used

### Frontend

- **React** ^19.1.0 - UI framework
- **TypeScript** ~5.8.3 - Type safety
- **Vite** ^7.0.4 - Build tooling
- **Tauri API** ^2 - Desktop app integration

### Backend

- **Rust** - Systems programming
- **Tauri** ^2 - App framework
- **Serde** ^1 - Serialization/deserialization
- **Headless Chrome** ^0.9.0 - Website monitoring

## 📊 Monitoring Features

### ✅ Integrated APIs

1. **Security Scans** - Comprehensive vulnerability assessment
2. **Lighthouse Metrics** - Performance auditing via [Lighthouse API](https://lighthouse-metrics.com/docs/api)
3. **Uptime Monitoring** - Availability tracking via [Uptime Robot API](https://uptimerobot.com/api/v3/)

### 🎯 Custom Features

- Real-time performance metrics
- Automated screenshot capture
- Historical data tracking
- Alerting system
- Multi-website dashboard

## 🚧 Development Notes

1. [Usage with yarn workspaces](https://tanstack.com/router/latest/docs/framework/react/installation#usage-with-yarn-workspaces)

### Package Configuration

```json
{
  "name": "webheartbeat",
  "version": "0.1.0",
  "type": "module",
  "dependencies": {
    "@tauri-apps/api": "^2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  }
}
```

```toml
[package]
name = "webheartbeat"
version = "0.1.0"
description = "A Tauri App"
authors = ["you"]
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
# The `_lib` suffix may seem redundant but it is necessary
# to make the lib name unique and wouldn't conflict with the bin name.
# This seems to be only an issue on Windows, see https://github.com/rust-lang/cargo/issues/8519
name = "webheartbeat_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
headless_chrome = "0.9.0"
base64 = "0.13.0"
# For async operations
tokio = { version = "1.0", features = ["full"] }
# For date/time handling
chrono = { version = "0.4", features = ["serde"] }

[profile.dev]
incremental = true # Compile your binary in smaller steps.

[profile.release]
codegen-units = 1 # Allows LLVM to perform better optimization.
lto = true # Enables link-time-optimizations.
opt-level = "s" # Prioritizes small binary size. Use `3` if you prefer speed.
panic = "abort" # Higher performance by disabling panic handlers.
strip = true # Ensures debug symbols are removed.

```

[Cargo Configuration- Size](https://v2.tauri.app/concept/size/)

### CSS Features

Utilizes modern CSS features including:

- `light-dark()` function for automatic theme switching
- CSS Variables for consistent theming
- Responsive design principles

## 🤖 AI Integration

The project includes MCP (Model Context Protocol) support for AI agent integration, enabling intelligent monitoring alerts and automated optimization suggestions.

---

**⭐ Star us on GitHub!** - Your support helps us make web monitoring better for everyone

*Built with ❤️ using cutting-edge web technologies*
