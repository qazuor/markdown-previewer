# Welcome to MarkView!

**MarkView** is a powerful, modern Markdown editor with live preview. Write beautiful documentation, notes, and more with real-time visualization.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Cloud Integration](#cloud-integration)
3. [Markdown Syntax](#markdown-syntax)
4. [Advanced Features](#advanced-features)
5. [Export Options](#export-options)
6. [View Modes](#view-modes)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Settings & Customization](#settings--customization)

---

## Getting Started

### Creating Documents

- **New Document**: `Ctrl+N` or **File > New**. The document name will automatically enter edit mode with "Untitled" selected, and a heading will be added with your chosen name.
- **Import Files**: Drag & drop `.md` files or use **File > Import**
- **Multiple Tabs**: Work with several documents at once
- **From Cloud**: Open files directly from GitHub or Google Drive via the sidebar

### Saving Your Work

- **Auto-save**: Your changes are automatically saved locally
- **Cloud Auto-save**: Google Drive files auto-save after 30 seconds of inactivity
- **Manual Save**: `Ctrl+S` saves to local storage, or to the cloud (GitHub/Google Drive) depending on document source
- **Version History**: Access previous versions via **right-click on tab**

### Managing Documents

- **Context Menu**: Right-click on files for options: Rename, Duplicate, Export, Delete
- **Cloud Delete**: When deleting cloud files, choose to remove locally only or also delete from the cloud
- **Rename**: Double-click on tab or press `F2` to rename

---

## Cloud Integration

### GitHub

Connect your GitHub account to work with your repositories directly:

1. Go to **Settings > Sync** and click **Connect GitHub**
2. Authorize MarkView to access your repositories
3. Browse your repos in the **GitHub** section of the sidebar
4. Open, edit, and save markdown files
5. Create new files with **New File** button
6. Commit changes with custom commit messages
7. Delete files from repositories

### Google Drive

Sync your documents with Google Drive:

1. Go to **Settings > Sync** and click **Connect Google Drive**
2. Authorize MarkView to access your Drive
3. Browse your files in the **Google Drive** section of the sidebar
4. Open and edit markdown files
5. Create new files in any folder (you can also create new folders)
6. **Auto-save**: Changes are automatically saved to Drive after 30 seconds
7. **Manual save**: Press `Ctrl+S` to save immediately
8. **Sync Status**: See the sync status in the status bar (Saved, Syncing, Pending)

### Deleting Cloud Documents

When you delete a document from GitHub or Google Drive:

1. A dialog will ask what you want to do
2. **Remove from list only**: Removes the file from MarkView but keeps it in the cloud
3. **Also delete from cloud**: Permanently deletes the file from GitHub/Google Drive

---

## Markdown Syntax

### Text Formatting

| Style | Syntax | Result |
|-------|--------|--------|
| Bold | `**text**` | **text** |
| Italic | `*text*` | *text* |
| Bold & Italic | `***text***` | ***text*** |
| Strikethrough | `~~text~~` | ~~text~~ |
| Inline Code | `` `code` `` | `code` |

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

### Lists

**Bullet List:**
- First item
- Second item
  - Nested item

**Numbered List:**
1. First step
2. Second step
3. Third step

**Task List:**
- [x] Completed task
- [ ] Pending task
- [ ] Another task

### Links and Images

```markdown
[Link Text](https://example.com)
![Image Alt Text](https://example.com/image.png)
```

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Horizontal Rule

Use `---` to create a horizontal line separator.

---

## Advanced Features

### Code Blocks with Syntax Highlighting

MarkView supports syntax highlighting for 100+ programming languages:

```javascript
// JavaScript
function greet(name) {
    return `Hello, ${name}!`;
}

const users = ['Alice', 'Bob', 'Charlie'];
users.forEach(user => console.log(greet(user)));
```

```python
# Python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print([fibonacci(i) for i in range(10)])
```

```typescript
// TypeScript
interface User {
    id: number;
    name: string;
    email: string;
}

const createUser = (data: Partial<User>): User => ({
    id: Date.now(),
    name: 'Anonymous',
    email: '',
    ...data
});
```

### Mermaid Diagrams

Create flowcharts, sequence diagrams, and more:

**Flowchart:**

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

**Sequence Diagram:**

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Server

    User->>App: Write Markdown
    App->>App: Live Preview
    User->>App: Export Document
    App->>Server: Process Export
    Server-->>App: Return File
    App-->>User: Download
```

**Class Diagram:**

```mermaid
classDiagram
    class Document {
        +String id
        +String name
        +String content
        +save()
        +export()
    }
    class Editor {
        +render()
        +format()
    }
    Document --> Editor
```

### Mathematical Formulas (KaTeX)

Write beautiful math equations:

**Inline Math:** The formula $E = mc^2$ changed physics forever.

**Block Math:**

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n
$$

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

### Callouts

Use callouts to highlight important information:

> **NOTE:** This is informational content that provides additional context.

> **TIP:** A helpful suggestion to improve your workflow.

> **WARNING:** Important information that requires attention.

> **IMPORTANT:** Critical information you should not miss.

> **CAUTION:** Proceed with care when following these instructions.

### Tables

| Feature | Description | Shortcut |
|---------|-------------|----------|
| Bold | Make text bold | `Ctrl+B` |
| Italic | Make text italic | `Ctrl+I` |
| Link | Insert hyperlink | `Ctrl+K` |
| Code | Insert code block | `Ctrl+Shift+`` |

---

## Export Options

Export your documents in multiple formats:

| Format | Description | Use Case |
|--------|-------------|----------|
| **Markdown** (.md) | Raw markdown file | Sharing, version control |
| **HTML** | Styled web page | Web publishing |
| **PDF** | Portable document | Printing, sharing |
| **PNG** | Image format | Social media, presentations |
| **JPEG** | Compressed image | Quick sharing |

Access exports via **File > Export** or right-click menu.

---

## View Modes

### Split View (Default)

See your editor and preview side by side. Perfect for writing and checking formatting simultaneously.

### Editor Only

Focus entirely on writing. Hide the preview for distraction-free editing.

### Preview Only

Review your final document without the editor visible.

### Preview in New Window

Open the preview in a separate window. Great for dual-monitor setups.

### Zen Mode

Press `F11` for a completely distraction-free writing experience. All UI elements are hidden, leaving only your content.

---

## Keyboard Shortcuts

### Text Formatting

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+Shift+S` | Strikethrough |
| `Ctrl+`` | Inline code |
| `Ctrl+Shift+`` | Code block |

### Headings

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Heading 1 |
| `Ctrl+2` | Heading 2 |
| `Ctrl+3` | Heading 3 |
| `Ctrl+4` to `Ctrl+6` | Heading 4-6 |

### Lists

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+8` | Bullet list |
| `Ctrl+Shift+7` | Numbered list |
| `Ctrl+Shift+9` | Task list |

### Insert Elements

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Insert link |
| `Ctrl+Shift+I` | Insert image |
| `Ctrl+Shift+Q` | Blockquote |

### Navigation & Search

| Shortcut | Action |
|----------|--------|
| `Ctrl+G` | Go to line |
| `Ctrl+F` | Find |
| `Ctrl+H` | Find and replace |
| `F3` | Find next |
| `Shift+F3` | Find previous |

### Application

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New document |
| `Ctrl+S` | Save |
| `Ctrl+W` | Close tab |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+,` | Settings |
| `Ctrl+/` | Keyboard shortcuts |
| `F11` | Zen mode |
| `Esc` | Exit Zen mode / Close modal |

### Zoom

| Shortcut | Action |
|----------|--------|
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |
| `Ctrl+Scroll` | Zoom with mouse wheel |

---

## Settings & Customization

Access settings via `Ctrl+,` or **File > Settings**:

### Appearance

- **Theme**: Light, Dark, or System (auto-detect)
- **Preview Style**: GitHub or Default
- **Font Size**: Adjustable for editor and preview

### Editor

- **Auto-save**: Automatically save changes
- **Format on Save**: Clean up markdown on save
- **Line Numbers**: Show/hide line numbers
- **Word Wrap**: Enable/disable text wrapping

### Language

- English
- Spanish (Espanol)

---

## Sidebar Features

### File Explorer

Manage all your open documents. Right-click for options:
- Rename
- Duplicate
- Export As (Markdown, HTML, Plain Text)
- Delete

### GitHub Explorer

Browse your GitHub repositories:
- Select repository and branch
- Navigate folder structure
- Open markdown files
- Create new files
- Delete files (with commit)

### Google Drive Explorer

Access your Google Drive files:
- Browse folders
- Open markdown files
- Create new files (with folder selection)
- Create new folders
- Delete files

### Table of Contents

Navigate through your document's headings. Click any heading to jump to that section.

### Search & Replace

- **Find**: Search within the current document
- **Replace**: Replace single or all occurrences
- **Options**: Case sensitive, Regular expressions

---

## Tips & Tricks

1. **Drag & Drop**: Drop `.md` files directly into the editor
2. **Tab Management**: Right-click tabs for quick actions
3. **Version History**: Never lose your work with automatic versioning
4. **Emoji Support**: Use the emoji picker in the toolbar
5. **Quick Headings**: Use the heading dropdown in the toolbar

---

## Coming Soon

We are actively working on new features:

### Local File Management

- **Open Local Folder**: Open all markdown files recursively from a folder
- **Folder Organization**: Organize your local documents into folders

### Editor Enhancements

- **Interactive Checklists**: Click checkboxes in preview to toggle them
- **Markdown Linting**: Real-time error detection with markdownlint
- **Auto Formatting**: Format your markdown with Prettier

### More Cloud Integrations

- **Dropbox**: Sync your documents with Dropbox
- **OneDrive**: Sync with Microsoft OneDrive
- **GitLab**: Support for GitLab repositories

### Desktop App

- **Native Application**: Tauri-based app for Windows, macOS, and Linux
- **File Associations**: Open `.md` files directly with MarkView
- **Auto Updates**: Automatic updates when new versions are available

---

## Need Help?

- Press `Ctrl+/` to view all keyboard shortcuts
- Check the **Help** menu for the feature tour
- Visit our [documentation](https://github.com/qazuor/markview)

---

Happy writing!
