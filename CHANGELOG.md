# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-04

### 🎉 Initial Release

MarkView is a modern, feature-rich markdown editor with live preview, cloud sync, and progressive web app capabilities.

### Features

#### Editor
- **CodeMirror 6** - Modern, extensible code editor with excellent performance
- **Syntax Highlighting** - Full markdown syntax support with GitHub Flavored Markdown
- **Smart Auto-Complete** - Context-aware suggestions for headings, links, and more
- **Line Numbers & Minimap** - Enhanced navigation for long documents
- **Format on Save** - Automatically format markdown with Prettier
- **Real-time Linting** - Catch markdown issues as you type with remark-lint
- **Keyboard Shortcuts** - Complete keyboard navigation support

#### Preview
- **Live Preview** - Real-time rendering as you type with debounced updates
- **Synchronized Scrolling** - Editor and preview stay in sync
- **Multiple Themes** - GitHub, GitLab, Notion, Obsidian, Stack Overflow, Dev.to styles
- **Syntax Highlighting** - Beautiful code blocks with Shiki
- **Mermaid Diagrams** - Flowcharts, sequence diagrams, class diagrams, and more
- **KaTeX Math** - Beautiful mathematical equations
- **GFM Support** - Tables, task lists, strikethrough, autolinks
- **Callouts** - GitHub and Obsidian-style admonitions
- **Frontmatter** - YAML frontmatter parsing and display

#### Document Management
- **Multiple Tabs** - Work with several files simultaneously
- **Auto-Save** - Automatic saving to localStorage (customizable interval)
- **Version History** - Track and restore previous versions with diff viewer
- **Drag & Drop** - Drop files directly into the editor
- **File Explorer** - Browse and manage your documents
- **Search & Replace** - Powerful find and replace with regex support
- **Smart Document Creation** - New documents start with auto-edit name and H1 heading
- **Context Menus** - Right-click menus for files (rename, duplicate, export, delete)

#### Cloud Integration
- **GitHub Integration**
  - OAuth authentication
  - Browse and open files from your repositories
  - Create and save markdown files directly to GitHub
  - Commit changes with custom messages
  - Delete files from repositories
  - Branch selection support

- **Google Drive Integration**
  - OAuth authentication
  - Browse and open files from your Google Drive
  - Create files in any folder (with folder creation support)
  - Auto-save to Google Drive (30 seconds after last edit)
  - Manual save with Ctrl+S
  - Delete files from Drive or just remove from local list
  - Sync status indicator in status bar

#### Import & Export
- **Import Files** - Support for .md, .markdown, .txt, .mdx files
- **Export to Markdown** - Download as .md file with original formatting
- **Export to HTML** - Standalone HTML with embedded styles
- **Export to PDF** - PDF generation (client-side)
- **Export to Image** - PNG/JPEG export for sharing

#### Interface
- **Dark/Light Themes** - System preference detection with manual override
- **Responsive Design** - Mobile-friendly interface with adaptive layout
- **Internationalization** - Full support for English and Spanish
- **Customizable** - Font size, font family, editor preferences
- **Zen Mode** - Distraction-free writing mode (F11)
- **Keyboard Shortcuts** - Quick reference modal (Ctrl+/)
- **Context Menus** - Right-click menus for editor, preview, tabs, files, and more
- **Zoom Controls** - Keyboard, mouse wheel, and menu zoom support

#### Progressive Web App (PWA)
- **Installable** - Install as a standalone app on any device
- **Offline Support** - Work without internet connection
- **Auto Updates** - Automatic updates when new versions are available
- **Fast Loading** - Service worker caching for instant loading

#### Onboarding
- **Welcome Guide** - Interactive introduction for new users
- **Feature Tour** - Guided tour highlighting key UI elements
- **Help Menu** - Quick access to shortcuts, tour, and documentation

### Technical

#### Frontend
- React 18 with TypeScript 5.7
- Vite 6 for fast development and builds
- Zustand for state management
- Tailwind CSS for styling
- CodeMirror 6 for the editor
- unified/remark/rehype for markdown processing

#### Backend
- Hono for API framework
- Better Auth for OAuth authentication
- Drizzle ORM with Neon PostgreSQL
- Vercel Serverless Functions

#### Quality
- Comprehensive test suite with 2920+ tests
- 77%+ code coverage
- Unit tests for components, hooks, stores, and services
- Integration tests for API routes
- Biome for linting and formatting

### Fixed
- PWA service worker now correctly excludes `/api/` routes from navigation fallback
- OAuth callbacks properly reach the serverless function instead of being intercepted
- CORS configuration compatible with credentials

---

[0.1.0]: https://github.com/qazuor/markview/releases/tag/v0.1.0
