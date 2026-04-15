# GOST Flowchart Generator

A React + Vite + TypeScript application to automatically generate GOST-compliant (ГОСТ 19.701-90) flowcharts from C++ code. The system provides an interactive node-based editor using `@xyflow/react` (React Flow).

## Features
- **Upload C++ files**: It parses the basic structure (mockups for if, for, cout, cin) and creates standard flowchart layouts automatically.
- **Multiple Tabs**: Open functions in separate tabs.
- **Interactive Sandbox**: A free-form space to attach or move blocks manually and copy them between functions.
- **Color Customization**: A sidebar menu to change color schemas for different blocks (Process, Decision, I/O, etc).
- **Real-time Block Editing**: Select any block to edit its properties in real-time:
  - 📝 **Change text** - Edit block label
  - 🎨 **Change color** - Choose any color with a color picker or hex code
  - 📏 **Scale blocks** - Resize blocks from 0.5x to 2.0x
  - 📋 **Copy to clipboard** - Quick copy of block text
- **GOST compliance**: Strictly configured shapes via CSS/SVG polygons for standard shapes.
- **Image Export**: Save images via `html-to-image`.

## 🎯 Quick Start

### Editing Blocks
1. Click on any block on the canvas to select it
2. A properties panel appears on the right side
3. Edit text, color, and scale in real-time
4. Click the X button or empty space to deselect

### Block Properties Panel (Right Sidebar)
- **Text**: Edit the block label with a textarea
- **Color**: Use color picker or enter hex code (e.g., #FF5733)
- **Scale**: Adjust block size with slider or quick buttons
- **Copy**: Button to copy block text to clipboard
- **Info**: Shows block ID and type

## Scripts
- `npm run dev`: Start dev server.
- `npm run build`: Compile and build.

## Starting
Run `npm install` followed by `npm run dev` to launch the application.

## Debugging
A VS Code Task "Run Development Server" has been configured.

## Documentation
See [FEATURES.md](./FEATURES.md) for detailed information about block editing features.
