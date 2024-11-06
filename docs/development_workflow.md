# Development Workflow Notes

## Repository Structure
- Original repository: https://github.com/cline/cline.git
- Working directory: /home/matej/github/cline_with_api
- Local fork: /home/matej/github/cline_with_api/cline

## Key Files and Their Roles
- src/exports/index.ts: Main API implementation
- src/exports/cline.d.ts: Type definitions for external consumers
- src/shared/: Common types and utilities
- src/core/: Core extension functionality
- src/integrations/: VS Code integration components

## Working with Original Codebase
1. Reference original files using:
   ```bash
   git show upstream/main:path/to/file
   ```
   Example:
   ```bash
   git show upstream/main:package.json
   git show upstream/main:src/api/providers/anthropic.ts
   ```

2. Restore original files when needed:
   ```bash
   git checkout upstream/main -- path/to/file
   ```
   Example:
   ```bash
   git checkout upstream/main -- src/integrations/
   ```

## Development Process
1. Check original implementation:
   - Use git show to view original files
   - Understand existing patterns and types
   - Note dependencies and version requirements

2. Make changes:
   - Keep original metadata (author, publisher, etc.)
   - Maintain existing functionality
   - Add new features carefully

3. Build and verify:
   ```bash
   cd cline && npm install && ./build-vsix.sh
   ```
   - Watch for TypeScript errors
   - Address linting warnings
   - Check VSIX package generation

4. Fix issues iteratively:
   - Start with type errors
   - Fix build errors
   - Address linting warnings
   - Verify functionality

## Common Issues and Solutions
1. Type mismatches:
   - Check original type definitions
   - Update interface to match implementation
   - Fix implementation to match interface

2. Build errors:
   - Verify dependencies in package.json
   - Check import paths
   - Restore original files if needed

3. Integration issues:
   - Reference original implementation
   - Maintain consistent message types
   - Follow VS Code patterns

## Version Control Tips
1. Keep original files accessible:
   ```bash
   git remote add upstream https://github.com/cline/cline.git
   git fetch upstream
   ```

2. Check original implementations:
   ```bash
   git show upstream/main:path/to/file
   ```

3. Restore files when needed:
   ```bash
   git checkout upstream/main -- path/to/file
   ```

## Build Process
1. Clean build:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ./build-vsix.sh
   ```

2. Quick rebuild:
   ```bash
   npm install
   ./build-vsix.sh
   ```

## Testing Changes
1. Build VSIX package
2. Check for errors and warnings
3. Verify type safety
4. Test functionality

## Repository Management
- Keep original remote as 'upstream'
- Use fetch to get latest changes
- Checkout specific files as needed
- Maintain clean commit history

## Best Practices
1. Always check original implementation
2. Keep metadata consistent
3. Maintain type safety
4. Follow existing patterns
5. Document changes
6. Test thoroughly

## Tools Used
- git: Version control and file management
- npm: Package management
- TypeScript: Type checking
- ESLint: Code style
- VS Code: Development environment
