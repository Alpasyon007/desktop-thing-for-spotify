# Contributing Guide

## Welcome Contributors!

Thank you for your interest in contributing to Desktop Thing for Spotify! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Git
- A Spotify Developer account
- Basic knowledge of TypeScript, React, and Electron

### Setting Up Development Environment

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/yourusername/desktop-thing-for-spotify.git
   cd desktop-thing-for-spotify
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
    - Follow the [Setup Guide](../getting-started/SETUP.md)
    - Create `.env.local` with your Spotify credentials

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## Project Structure

Understanding the codebase structure helps you know where to make changes:

```
src/
├── app/                     # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
│
├── components/             # React components
│   └── spotify-player/     # Main player component
│       ├── components/     # UI components
│       ├── hooks/          # Custom hooks
│       ├── views/          # View components
│       └── utils/          # Utilities
│
├── lib/                    # Shared libraries
│   └── spotify.ts          # Spotify API client
│
└── types/                  # TypeScript definitions
```

For more details, see [Component Structure](../architecture/COMPONENT_STRUCTURE.md).

## How to Contribute

### Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Create a new issue** with:
    - Clear title and description
    - Steps to reproduce
    - Expected vs actual behavior
    - Screenshots if applicable
    - Environment details (OS, Node version, etc.)

### Suggesting Features

1. **Check existing issues** and discussions
2. **Create a feature request** with:
    - Clear use case
    - Expected behavior
    - Mockups or examples if applicable
    - Potential implementation approach

### Submitting Pull Requests

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
    - Follow the [Code Style Guide](./CODE_STYLE.md)
    - Write clear, focused commits
    - Add tests if applicable
    - Update documentation

3. **Test your changes**:
   ```bash
   npm run dev        # Test in development
   npm run build      # Ensure it builds
   npm run lint       # Check for linting errors
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**:
    - Provide a clear title and description
    - Reference any related issues
    - Include screenshots for UI changes
    - Wait for review and address feedback

## Commit Message Convention

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples**:

```
feat: add playlist search functionality
fix: resolve playback state polling issue
docs: update setup guide with troubleshooting
refactor: extract playback controls into hook
```

## Development Workflow

### Making Changes

1. **Locate the right file**:
    - UI changes → `components/`
    - Logic changes → `hooks/`
    - API changes → `lib/spotify.ts`
    - Styles → `.css` or Tailwind classes

2. **Make focused changes**:
    - Keep changes small and focused
    - One feature/fix per PR
    - Don't mix refactoring with features

3. **Test thoroughly**:
    - Test all affected features
    - Check different views
    - Test edge cases

### Adding New Features

Follow the component architecture:

1. **Determine the layer**:
    - Hook for business logic
    - Component for UI
    - View for page composition
    - Util for pure functions

2. **Create the file** in the appropriate directory

3. **Implement the feature** following existing patterns

4. **Update documentation** in `docs/`

5. **Add tests** (when test infrastructure exists)

## Code Review Process

### What Reviewers Look For

- **Code quality**: Clean, readable, maintainable code
- **Consistency**: Follows existing patterns and style
- **Tests**: Adequate test coverage (when applicable)
- **Documentation**: Updated docs for new features
- **Performance**: No unnecessary re-renders or heavy operations
- **Security**: No security vulnerabilities introduced

### Responding to Feedback

- **Be open**: Reviews help improve the code
- **Ask questions**: If feedback is unclear, ask!
- **Make changes**: Address feedback promptly
- **Explain decisions**: If you disagree, explain why
- **Stay professional**: Keep discussions respectful

## Testing

### Manual Testing

1. **Run the app**: `npm run dev`
2. **Test your changes**: Verify the feature works
3. **Test edge cases**: Try unusual inputs/scenarios
4. **Test other features**: Ensure nothing broke
5. **Test on different OS**: If possible

### Automated Testing (Future)

We plan to add:

- Unit tests for hooks
- Component tests for UI
- Integration tests for features
- E2E tests for critical flows

## Documentation

### When to Update Docs

- New features → Add to `docs/features/`
- Architecture changes → Update `docs/architecture/`
- Setup changes → Update `docs/getting-started/`
- Breaking changes → Update all relevant docs

### Documentation Standards

- Clear, concise language
- Code examples where helpful
- Screenshots for UI changes
- Update table of contents
- Follow existing format

## Common Tasks

### Adding a New UI Component

1. Create file in `src/components/spotify-player/components/`
2. Define TypeScript interface for props
3. Implement the component
4. Export from `exports.ts` if public
5. Use in parent component

**Example**:

```typescript
// components/NewComponent.tsx
interface NewComponentProps {
	data: string;
	onAction: () => void;
}

export function NewComponent({data, onAction}: NewComponentProps) {
	return (
		<div onClick = {onAction} >
			{data}
			< /div>
	);
}
```

### Adding a Custom Hook

1. Create file in `src/components/spotify-player/hooks/`
2. Implement hook following React patterns
3. Export from hook file
4. Use in components

**Example**:

```typescript
// hooks/useNewFeature.ts
export function useNewFeature() {
	const [state, setState] = useState(initialState);

	const action = useCallback(() => {
		// Logic here
	}, []);

	return {state, action};
}
```

### Adding a New View

1. Create file in `src/components/spotify-player/views/`
2. Compose existing components
3. Add view-specific logic
4. Update routing in `index.tsx`

### Modifying Spotify API Calls

1. Edit `src/lib/spotify.ts`
2. Update TypeScript types
3. Test with real Spotify account
4. Handle errors gracefully

## Troubleshooting Development Issues

### Build Errors

```bash
# Clear build cache
rm -rf .next out dist node_modules
npm install
npm run build:electron
npm run dev
```

### TypeScript Errors

```bash
# Check for errors
npx tsc --noEmit

# If in VSCode, reload window
# Cmd/Ctrl + Shift + P → "Reload Window"
```

### Electron Not Loading

```bash
# Rebuild Electron files
npm run build:electron

# Check main process logs in terminal
# Check renderer process logs in DevTools (Ctrl+Shift+I)
```

### Changes Not Reflecting

- Check if file is being imported
- Clear Next.js cache (`.next/`)
- Restart dev server
- Check for syntax errors

## Getting Help

### Resources

- [Documentation Hub](../README.md) - Start here
- [Architecture Overview](../architecture/OVERVIEW.md) - Understand the system
- [Component Structure](../architecture/COMPONENT_STRUCTURE.md) - Component organization

### Communication

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and ideas
- **Pull Request Comments** - Code-specific discussions

## Code of Conduct

### Be Respectful

- Be kind and courteous
- Respect different viewpoints
- Accept constructive criticism
- Focus on what's best for the project

### Be Collaborative

- Help others learn
- Share knowledge
- Review code thoughtfully
- Provide helpful feedback

### Be Professional

- Keep discussions on-topic
- No harassment or discrimination
- No spam or self-promotion
- Follow GitHub's Community Guidelines

## Recognition

Contributors will be:

- Listed in the project README
- Credited in release notes
- Appreciated in the community! 🎉

## Questions?

If you have questions:

1. Check the [documentation](../README.md)
2. Search [existing issues](https://github.com/yourusername/desktop-thing-for-spotify/issues)
3. Ask in [discussions](https://github.com/yourusername/desktop-thing-for-spotify/discussions)
4. Create a new issue

Thank you for contributing! 🚀

