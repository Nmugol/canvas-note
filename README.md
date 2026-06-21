# Canvas Note

Canvas Note is a modern, infinite-canvas note-taking and spatial reasoning application built using **Tauri**, **React**, and **TypeScript**. It provides an unconstrained workspace for arranging thoughts, media, and connections visually.

## ✨ Key Features

- **Infinite Canvas Workspace**: Pan and zoom across a boundless board.
- **Rich Block Types**: 
  - **Text**: Markdown-supported rich text editing.
  - **Media**: Drag and drop support for Images, Videos, Audio clips.
  - **Documents**: Built-in support for PDFs and Word Documents (`.doc`, `.docx`).
- **Connections & Links**: Connect any blocks together visually with dynamic lines to build mind-maps or flowcharts.
- **Plugin System**: Extend the core functionality by placing custom JavaScript plugins in the application's global plugins directory.
- **Customization**:
  - Light, Dark, and System theme support.
  - Custom UI Primary Colors.
  - Configurable UI (Minimap, Grid styles).
- **Internationalization (i18n)**: Support for English, Polish, German, Spanish, and French.

## 🛠 Tech Stack

- **Framework**: [Tauri v2](https://v2.tauri.app/) (Rust backend + Web frontend)
- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Material UI (MUI)](https://mui.com/) + Custom CSS Variables for theming

## 🚀 Getting Started

### Prerequisites

Make sure you have installed the necessary dependencies for Tauri development.
- [Rust](https://www.rust-lang.org/tools/install)
- [Deno](https://deno.land/)
- System dependencies required by Tauri (e.g., `libwebkit2gtk-4.1-dev` on Linux).

### Running Locally

To run the application in development mode:

```bash
deno install
deno task tauri dev
```

### Building for Production

To build an optimized executable for your operating system:

```bash
deno task tauri build
```

The compiled binaries will be available in `src-tauri/target/release/`.

## 🧩 Plugin System

Canvas Note features an external plugin architecture. The application loads `.js` files natively from the OS-specific plugins folder.
To view or install plugins, open the **Settings -> Plugins** tab in the application and click **"Open plugins folder"** .

Plugins must follow the standard Canvas Note plugin API to register new block types, tools, or behaviors. For detailed instructions and examples on creating custom plugins, please refer to the **[Plugin API Documentation](PLUGIN_API.md)**.

## 📝 Keyboard Shortcuts

- **Space + Click & Drag**: Pan around the canvas
- **Ctrl + Scroll**: Zoom in / out
- **Ctrl + 0**: Reset Zoom
- **Delete / Backspace**: Delete selected blocks or links

## 📄 License

This project is open-source and free to use.
