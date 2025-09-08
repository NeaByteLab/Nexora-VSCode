# 🤖 Nexora-VSCode

VSCode extension foundation for AI code assistance. Monitors file changes and captures context for AI models.

## ✨ Features

### 📁 Context Capture
- **File monitoring** - Monitors active file, cursor position, and code changes
- **Context data** - Captures code before/after cursor, diagnostics, language info
- **Real-time tracking** - Updates context as you code
- **Model support** - Multiple AI models via Ollama

### 🔗 AI Service Integration
- **Ollama integration** - Connect to local or remote AI models
- **Model selection** - Switch between available AI models
- **Account management** - Database storage for API keys and limits
- **Service testing** - Test connectivity to AI services

### ⚙️ Configuration
- **Database selection** - Choose database file with file picker
- **Settings validation** - Verify configuration and service availability
- **Context menus** - Right-click access to features
- **Error handling** - Error management and notifications

---

## 🗺️ Roadmap

### ✅ Completed
- [x] **AI service integration** - Ollama connection and model selection
- [x] **Command system** - Right-click menus and command palette integration
- [x] **Configuration management** - Settings and database path selection
- [x] **Context capture** - File monitoring and cursor position tracking
- [x] **Diagnostics integration** - VSCode error and warning detection

### 📋 Planned

#### 🚀 Core Completion Features
- [ ] **Auto completion provider** - VSCode completion item provider implementation
- [ ] **Inline suggestions display** - Ghost text showing AI suggestions
- [ ] **Intelligent suggestions** - Context-aware code recommendations
- [ ] **Multi-line edits** - AI suggests multiple code changes simultaneously

#### 🎯 User Interface & Interaction
- [ ] **Suggestion review UI** - Accept, reject, or modify AI code suggestions
- [ ] **Accept/Reject shortcuts** - Tab to accept, Esc to reject suggestions
- [ ] **Suggestion cycling** - Navigate through multiple suggestions (Ctrl+→)
- [ ] **Visual diff preview** - Show what will change before applying
- [ ] **Quick diff functionality** - Visual comparison of AI suggestions

#### 🔮 Predictive & Smart Features
- [ ] **Predictive autocomplete** - Autocomplete that predicts next edit
  - [ ] **Tab navigation** - Use TAB shortcut to jump through AI edits
- [ ] **Smart context-aware suggestions** - Workspace activity-based completions
- [ ] **Comment-to-code generation** - Generate code from comments
- [ ] **Test generation** - Generate tests from existing code

#### 🌐 Language & Performance
- [ ] **Multi-language support** - Enhanced language detection and processing
- [ ] **Performance optimization** - Smart activity detection and debounced processing

---

## 🚀 Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/NeaByteLab/Nexora-VSCode.git
   cd Nexora-VSCode
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build extension**
   ```bash
   npm run build
   ```

4. **Install in VSCode**
   - Open VSCode
   - Go to Extensions view (`Ctrl+Shift+X`)
   - Click "Install from VSIX" and select the built extension

---

## ⚙️ Configuration

### 📋 Prerequisites
- **Ollama** - Install and run Ollama service locally or remotely
- **Database** - SQLite database for account management (optional for remote services)

### 🔧 Settings
Configure through VSCode settings:

```json
{
  "Nexora-AI.UrlHost": "http://localhost:11434",
  "Nexora-AI.DatabasePath": "/path/to/your/nexora.db",
  "Nexora-AI.SelectedModel": "llama2"
}
```

### 🎯 Commands
Access through command palette (`Ctrl+Shift+P`):

- **Nexora AI: Open Configuration** - Open extension settings
- **Nexora AI: Check Configuration** - Validate setup
- **Nexora AI: Select Model** - Choose AI model
- **Nexora AI: Select Database Path** - Set database file location
- **Nexora AI: Test Service** - Test AI service connectivity

---

## 🎯 Usage

### 🖱️ Context Menu
Right-click in editor or explorer:
- **Nexora AI** submenu with all commands

### 📁 File Monitoring
Extension automatically:
- **Monitors** active file and cursor position
- **Captures** code context and diagnostics
- **Provides** information to AI models
- **Logs** context information to debug console

### 👀 Context Monitoring
- **Select model** using model selection command
- **Configure database** for account management (if using remote services)
- **Test connectivity** to verify setup
- **Start coding** - extension captures context automatically
- **View context** - Check debug console for captured context data

---

## 🔧 Development

### 📁 Project Structure
```
src/
├── cmd/           # Command implementations
├── config/        # Configuration management
├── constants/     # Application constants
├── interfaces/    # TypeScript interfaces
├── listeners/     # File monitoring
├── schemas/       # Zod validation schemas
├── services/      # External service integration
└── utils/         # Utility functions
```

### 🏗️ Building
```bash
# Install dependencies
npm install

# Build extension
npm run build

# Watch for changes
npm run watch
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.