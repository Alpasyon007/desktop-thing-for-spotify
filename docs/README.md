# Documentation Hub

Welcome to the Desktop Thing for Spotify documentation! This guide will help you find the information you need.

## 📚 Quick Links

- [Getting Started Guide](./getting-started/SETUP.md) - Set up and run the application
- [Architecture Overview](./architecture/OVERVIEW.md) - Understand the system design
- [Features Documentation](./features/) - Learn about specific features
- [Development Guide](./development/CONTRIBUTING.md) - Contribute to the project

## 🚀 Getting Started

New to the project? Start here:

1. **[Setup Guide](./getting-started/SETUP.md)** - Install dependencies and configure Spotify API
2. **[Usage Guide](./getting-started/USAGE.md)** - Learn how to use all features
3. **[Architecture Overview](./architecture/OVERVIEW.md)** - Understand how it all works

## 🏗️ Architecture Documentation

Understand the technical design:

- **[Architecture Overview](./architecture/OVERVIEW.md)** - High-level system design
- **[Component Structure](./architecture/COMPONENT_STRUCTURE.md)** - React component organization
- **[Electron Integration](./architecture/ELECTRON_INTEGRATION.md)** - Desktop app implementation
- **[State Management](./architecture/STATE_MANAGEMENT.md)** - How data flows through the app

## ✨ Features Documentation

Learn about specific features:

- **[Always on Top](./features/ALWAYS_ON_TOP.md)** - Keep window above others
- **[Context Menu](./features/CONTEXT_MENU.md)** - Right-click menu system
- **[Window Controls](./features/WINDOW_CONTROLS.md)** - Minimize and close buttons
- **[Drag Handle](./features/DRAG_HANDLE.md)** - Move the frameless window
- **[Playlists View](./features/PLAYLISTS.md)** - Browse and play playlists
- **[Persistent Playback](./features/PERSISTENT_PLAYBACK.md)** - Remember last played track

## 🛠️ Development Documentation

Contributing to the project:

- **[Contributing Guide](./development/CONTRIBUTING.md)** - How to contribute
- **[Code Style Guide](./development/CODE_STYLE.md)** - Coding standards
- **[Testing Guide](./development/TESTING.md)** - Testing practices
- **[Build and Deploy](./development/BUILD_DEPLOY.md)** - Production builds

## 📖 Historical Documentation

Previous implementation details and refactoring notes:

- **[Refactoring Summary](./history/REFACTORING_SUMMARY.md)** - Overview of major refactors
- **[Refactoring Complete](./history/REFACTORING_COMPLETE.md)** - Detailed refactoring notes
- **[Native Menu Customization](./history/NATIVE_MENU_CUSTOMIZATION.md)** - Menu implementation evolution
- **[Native Menu with Drag Regions](./history/NATIVE_MENU_WITH_DRAG_REGIONS.md)** - Drag handling evolution
- **[Toggleable Drag Handle](./history/TOGGLEABLE_DRAG_HANDLE.md)** - Drag handle iterations

## 🔍 Finding What You Need

### I want to...

| Goal                                  | Documentation                                                              |
|---------------------------------------|----------------------------------------------------------------------------|
| Set up the project for the first time | [Setup Guide](./getting-started/SETUP.md)                                  |
| Learn how to use the app              | [Usage Guide](./getting-started/USAGE.md)                                  |
| Understand the code structure         | [Component Structure](./architecture/COMPONENT_STRUCTURE.md)               |
| Add a new feature                     | [Contributing Guide](./development/CONTRIBUTING.md)                        |
| Fix a bug                             | [Architecture Overview](./architecture/OVERVIEW.md) + relevant feature doc |
| Build for production                  | [Build and Deploy](./development/BUILD_DEPLOY.md)                          |
| Understand Electron integration       | [Electron Integration](./architecture/ELECTRON_INTEGRATION.md)             |
| Learn about a specific feature        | Check [Features](./features/) directory                                    |

## 📁 Documentation Structure

```
docs/
├── README.md                          # This file - documentation hub
│
├── getting-started/                   # New user guides
│   ├── SETUP.md                      # Installation and configuration
│   └── USAGE.md                      # How to use the application
│
├── architecture/                      # System design documentation
│   ├── OVERVIEW.md                   # High-level architecture
│   ├── COMPONENT_STRUCTURE.md        # React component organization
│   ├── ELECTRON_INTEGRATION.md       # Electron implementation
│   └── STATE_MANAGEMENT.md           # State flow and management
│
├── features/                          # Feature-specific documentation
│   ├── ALWAYS_ON_TOP.md             # Always on top feature
│   ├── CONTEXT_MENU.md              # Context menu system
│   ├── WINDOW_CONTROLS.md           # Window control buttons
│   ├── DRAG_HANDLE.md               # Window dragging
│   ├── PLAYLISTS.md                 # Playlists view
│   └── PERSISTENT_PLAYBACK.md       # Last played state
│
├── development/                       # Development guides
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   ├── CODE_STYLE.md                # Coding standards
│   ├── TESTING.md                   # Testing guide
│   └── BUILD_DEPLOY.md              # Build process
│
└── history/                           # Historical documentation
    ├── REFACTORING_SUMMARY.md       # Refactoring overview
    ├── REFACTORING_COMPLETE.md      # Detailed refactoring notes
    └── ...                          # Other historical docs
```

## 🤝 Contributing to Documentation

Documentation is important! If you find something unclear or missing:

1. Check if there's already an issue about it
2. Create a new issue describing what's unclear
3. Or better yet, submit a PR with improvements!

### Documentation Standards

- Use clear, concise language
- Include code examples where helpful
- Add diagrams for complex concepts
- Keep it up-to-date with code changes
- Follow the existing structure and format

## 📝 Documentation Best Practices

When writing or updating documentation:

1. **Be Clear**: Write for someone unfamiliar with the code
2. **Be Concise**: Don't over-explain, but don't under-explain
3. **Be Current**: Keep docs in sync with code changes
4. **Be Helpful**: Include examples and common use cases
5. **Be Organized**: Follow the established structure

## 🔄 Recently Updated

- **Architecture Overview** - Comprehensive system design documentation
- **Component Structure** - Detailed component organization guide
- **Electron Integration** - Complete Electron implementation guide
- **Feature Docs** - New dedicated pages for each feature
- **Getting Started** - Updated setup and usage guides

## 📞 Need Help?

If you can't find what you're looking for:

1. Check the [GitHub Issues](https://github.com/yourusername/desktop-thing-for-spotify/issues)
2. Search existing documentation
3. Ask in discussions
4. Create a new issue with the `documentation` label

---

**Last Updated**: November 26, 2025  
**Documentation Version**: 2.0.0

