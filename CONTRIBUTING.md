# Contributing to NuxtWP Multilang Theme

Thank you for your interest in contributing to the NuxtWP Multilang Theme! This guide will help you get started with contributing to this modern Nuxt 4 multilingual WordPress-inspired theme.

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 22.0.0
- Yarn ≥ 1.22.0 (Required - we use Yarn for consistent package management)
- Docker (for multi-database development environment)
- Git (for version control)

### Development Setup

1. **Fork & Clone**

   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/nuxt-wp-multilang-theme.git
   cd nuxt-wp-multilang-theme
   ```

2. **Install Dependencies**

   ```bash
   # Install with Yarn (required)
   yarn install

   # Do NOT use npm or pnpm - this project uses Yarn exclusively
   ```

3. **Environment Configuration**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Configure your environment variables
   # Essential variables are documented in .env.example
   ```

4. **Start Development Environment**

   ```bash
   # Start all database services (PostgreSQL, MySQL, MongoDB, Redis)
   docker compose up -d

   # Generate all Prisma clients
   yarn prisma:generate

   # Run database migrations
   yarn prisma:migrate

   # Seed databases with sample data (optional)
   yarn db:seed

   # Start development server
   yarn dev --port 4000
   ```

5. **Verify Setup**
   - Visit http://localhost:4000 to see the application
   - Check http://localhost:5555 for Prisma Studio
   - Access http://localhost:8080 for Adminer (multi-database admin)

## 📋 Development Workflow

### Branch Strategy

1. **Fork the repository** to your GitHub account
2. **Create feature branch** from `master` (we use `master` as main branch)
3. **Make focused changes** - one feature/fix per branch
4. **Test thoroughly** - ensure all tests pass
5. **Submit Pull Request** to `master` branch

```bash
# Create and switch to feature branch
git checkout -b feature/sidebar-improvements

# Make your changes, then commit
git add .
git commit -m "feat(layout): improve sidebar mobile responsiveness"

# Push to your fork
git push origin feature/sidebar-improvements
```

### Yarn-Based Development Commands

```bash
# Development server
yarn dev                      # Start on port 3000
yarn dev --port 4000         # Start on specific port
yarn build                   # Production build
yarn preview                 # Preview production build

# Code Quality
yarn lint                    # Run ESLint + Prettier
yarn lint:fix               # Auto-fix linting issues
yarn typecheck              # TypeScript type checking
yarn format                 # Format code with Prettier

# Testing
yarn test                   # Run all tests (unit + E2E)
yarn test:unit              # Unit tests only (Vitest)
yarn test:e2e               # E2E tests only (Playwright)
yarn test:unit:coverage     # Unit tests with coverage

# Database Operations
yarn prisma:generate        # Generate all Prisma clients
yarn prisma:migrate         # Run database migrations
yarn prisma:studio          # Open Prisma Studio
yarn prisma:reset           # Reset databases (development only)

# Git Hooks & Validation
yarn prepare               # Setup Husky git hooks
yarn commitlint            # Validate commit messages
```

## 📝 Code Standards

### TypeScript Guidelines

- **Strict Mode**: Use TypeScript strict mode - no `any` types allowed
- **Explicit Typing**: Always type function parameters and return values
- **Interface Definitions**: Create interfaces for complex objects
- **Existing Patterns**: Follow established patterns in the codebase

```typescript
// ✅ Good - Explicit typing
interface SidebarProps {
  modelValue: boolean
  items?: NavigationItem[]
}

const toggleSidebar = (isOpen: boolean): void => {
  sidebarOpen.value = isOpen
}

// ❌ Bad - Implicit any types
const handleClick = (event) => {
  // Missing types
}
```

### Vue 3 Component Guidelines

- **Composition API**: Use `<script setup>` syntax exclusively
- **TypeScript Integration**: Proper typing for props, emits, and refs
- **Explicit Imports**: Import layout components explicitly if auto-import fails
- **Reactive Patterns**: Use `ref`, `reactive`, and `computed` appropriately

```vue
<!-- ✅ Good - Modern component pattern -->
<script setup lang="ts">
interface Props {
  modelValue: boolean
  variant?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Composable integration
const { t } = useI18n()
const { loggedIn } = useUserSession()
</script>
```

### CSS & Styling Guidelines

- **Tailwind CSS**: Use Tailwind utility classes - avoid custom CSS when possible
- **CSS Variables**: Use CSS custom properties for theme values (not @apply directives)
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Dark Mode**: Always include dark mode variants

```css
/* ✅ Good - CSS variables for theming */
.sidebar {
  background-color: var(--color-background);
  border-color: var(--color-border);
}

/* ❌ Bad - @apply directives (causes conflicts) */
.sidebar {
  @apply bg-background border-border;
}
```

### Database Patterns

- **Multi-Database**: Follow established patterns for PostgreSQL, MySQL, MongoDB
- **Service Layer**: Use service classes for database operations
- **Type Safety**: Leverage Prisma's generated types
- **Migrations**: Always use migrations - never `db push` in production

```typescript
// ✅ Good - Service layer pattern
export class ArticleService {
  private client = getPostgresClient()

  async getPublishedArticles(locale: string): Promise<Article[]> {
    return await this.client.article.findMany({
      where: { published: true, language: locale }
    })
  }
}
```

## 🧪 Testing Requirements

### Before Submitting PR

```bash
# Run full test suite
yarn test

# Check code quality
yarn lint
yarn typecheck

# Verify build
yarn build

# Test database operations
yarn prisma:generate
yarn prisma:migrate
```

### Testing Guidelines

- **Unit Tests**: Write tests for utilities and composables
- **E2E Tests**: Test critical user flows (authentication, navigation)
- **Component Testing**: Test layout components (AppSidebar, AppFooter)
- **API Testing**: Test server endpoints and database operations

### Project Structure Knowledge

```
app/
├── components/layout/        # AppSidebar, AppFooter (key components)
├── layouts/default.vue       # Main layout with sidebar
├── assets/css/main.css      # Consolidated CSS (no @apply)
└── pages/                   # File-based routing

prisma/
├── schema.prisma            # PostgreSQL CMS
├── mysql/                   # WordPress integration
├── mongo/                   # Analytics database
└── generated/               # Generated clients

server/
├── api/                     # API endpoints
├── services/               # Business logic layer
└── utils/                  # Server utilities

docs/                       # Comprehensive documentation
i18n/locales/              # 7 language translations
```

## 🔄 Pull Request Guidelines

### Pre-Submission Checklist

**Before submitting your PR, ensure:**

- [ ] **All tests pass** - `yarn test` succeeds
- [ ] **Code is linted** - `yarn lint` passes without errors
- [ ] **Types are valid** - `yarn typecheck` passes
- [ ] **Build succeeds** - `yarn build` completes successfully
- [ ] **Database migrations work** - `yarn prisma:migrate` applies cleanly
- [ ] **Changes are focused** - One feature/fix per PR
- [ ] **Documentation updated** - If adding features, update relevant docs
- [ ] **Commit messages follow convention** - Using conventional commit format

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) enforced by Husky hooks:

```bash
# Format: type(scope): description
feat(sidebar): add mobile overlay functionality
fix(css): resolve bg-background variable conflicts
docs(readme): update installation instructions
chore(deps): upgrade Nuxt to 4.1.3
refactor(layout): consolidate CSS variables
test(e2e): add sidebar navigation tests
```

**Commit Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `style`: Code formatting (not CSS)
- `refactor`: Code restructuring
- `test`: Adding/updating tests
- `ci`: CI/CD changes
- `perf`: Performance improvements

### PR Description Template

```markdown
## What Changes Were Made

- Brief description of changes
- List key files modified
- Highlight any breaking changes

## Why These Changes Were Needed

- Explain the problem being solved
- Reference any related issues (#123)
- Provide context for the solution

## How to Test These Changes

1. Checkout this branch
2. Run `yarn install && yarn dev`
3. Test specific functionality
4. Verify responsive behavior
5. Check multi-language support

## Screenshots (if applicable)

- Before/after images for UI changes
- Mobile and desktop views
- Dark/light mode variations

## Breaking Changes

- List any breaking changes
- Provide migration instructions
- Update version requirements

## Additional Notes

- Any special considerations
- Performance implications
- Future improvements planned
```

### Review Process

1. **Automated Checks**: GitHub Actions run linting, testing, and type checking
2. **Code Review**: Maintainers review code quality and architecture
3. **Testing**: Manual testing of functionality and edge cases
4. **Documentation**: Ensure documentation is updated if needed
5. **Merge**: Approved PRs are merged to master branch

### Types of Contributions

#### 🐛 Bug Fixes

- Fix CSS variable conflicts
- Resolve component auto-import issues
- Database migration problems
- Mobile responsiveness issues

#### ✨ New Features

- New layout components
- Database integrations
- i18n language additions
- Admin dashboard enhancements

#### 📚 Documentation

- API documentation updates
- Component usage examples
- Setup instructions improvements
- Architecture explanations

#### 🧪 Testing

- Unit test coverage improvements
- E2E test scenarios
- Component testing
- Database operation testing

#### ⚡ Performance

- Bundle size optimizations
- Database query improvements
- CSS loading optimizations
- Image/asset optimizations

## ❓ Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community chat
- **Pull Request Reviews**: Code-specific discussions

### Before Asking Questions

1. **Search existing issues** and pull requests
2. **Check documentation** in `/docs/` directory
3. **Review README.md** for setup instructions
4. **Look at existing code** for patterns and examples

### Issue Templates

When creating issues, use our templates:

- **🐛 Bug Report**: For reporting bugs with reproduction steps
- **✨ Feature Request**: For suggesting new features
- **📚 Documentation**: For documentation improvements
- **❓ Question**: For usage questions and help

### Code of Conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

### Security Issues

Report security vulnerabilities per our [Security Policy](SECURITY.md) - do not create public issues for security problems.

## 🏆 Recognition

Contributors are recognized in:

- **README.md**: Contributor acknowledgments section
- **CHANGELOG.md**: Feature and fix attributions
- **GitHub Contributors**: Automatic recognition on repository
- **Release Notes**: Major contributions highlighted

---

**Thank you for contributing to NuxtWP Multilang Theme!**

_Built with ❤️ by Aleksandar Stajic and the open source community_
