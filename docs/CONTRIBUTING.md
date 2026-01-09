# 🤝 Contributing to Electric Safai

```
╔═══════════════════════════════════════════════════════════════╗
║         ⚡ Welcome, Fellow Search Warrior! ⚡                  ║
╚═══════════════════════════════════════════════════════════════╝
```

We're thrilled you want to contribute to Electric Safai! This document will guide you through the process.

---

## 🌟 Ways to Contribute

1. 🐛 **Bug Reports** — Found a bug? Let us know!
2. 💡 **Feature Requests** — Have an idea? Share it!
3. 📝 **Documentation** — Help improve our docs
4. 🔧 **Code Contributions** — Submit a PR!
5. 🧪 **Testing** — Write tests or report test failures

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/es-search.git
cd es-search
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

### 4. Run Tests

```bash
npm test
```

---

## 📋 Development Workflow

### Branch Naming

- `feature/your-feature-name` — New features
- `fix/bug-description` — Bug fixes
- `docs/what-you-documented` — Documentation
- `refactor/what-you-refactored` — Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add scroll timeout configuration
fix: handle empty aggregation response
docs: update API reference
test: add logger unit tests
refactor: simplify query conversion
```

---

## 🧪 Testing Guidelines

### Run All Tests

```bash
npm test
```

### Run with Coverage

```bash
npm run test:coverage
```

### Run in Watch Mode

```bash
npm run test:watch
```

### Writing Tests

- Place unit tests in `tests/unit/`
- Place integration tests in `tests/integration/`
- Use descriptive test names
- Mock external dependencies

---

## 📝 Code Style

We use ESLint and Prettier. Before committing:

```bash
npm run lint
npm run format
```

### Key Guidelines

- Use TypeScript strict mode
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Handle errors gracefully

---

## 🔄 Pull Request Process

1. **Create a branch** from `master`
2. **Make your changes** with tests
3. **Run all checks**: `npm run lint && npm test`
4. **Push your branch** and create a PR
5. **Describe your changes** clearly
6. **Wait for review** and address feedback

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated if needed
- [ ] No breaking changes (or documented)
```

---

## 🏗️ Project Structure

```
es-search/
├── src/                 # TypeScript source
│   ├── index.ts        # Main entry
│   ├── cli.ts          # CLI interface
│   ├── elasticsearch.ts # ES client
│   ├── logger.ts       # Logging
│   └── types.ts        # Type definitions
├── tests/              # Test files
│   ├── setup.ts       # Test configuration
│   └── unit/          # Unit tests
├── scripts/            # Shell scripts
├── docs/              # Documentation
└── bin/               # CLI executable
```

---

## 💬 Getting Help

- 📖 Read the [API Documentation](./API.md)
- 🔍 Search existing issues
- 💬 Open a discussion
- ✉️ Contact maintainers

---

## 🙏 Code of Conduct

Be respectful, inclusive, and constructive. We're all here to learn and build something great together.

---

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   "Every contribution, no matter how small,                    │
│    adds to the power of Electric Safai."                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

⚡ Thank you for contributing! ⚡
