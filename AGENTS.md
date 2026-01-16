### General Rules

- Early development, no users. No backwards compatibility concerns. Do things RIGHT: clean,
  organized, zero tech debt. Never create compatibility shims.

- WE NEVER WANT WORKAROUNDS. we always want FULL implementations that are long term
  suistainable for many >1000 users. so dont come up with half baked solutions

- Important: Do not remove, hide, or rename any existing features or UI options (even
  temporarily) unless I explicitly ask for it. If something isn’t fully wired yet, keep the UX
  surface intact and stub/annotate it instead of deleting it.

- Always ask more questions using AskUserQuestionTool until you have enough context to give an accurate & confident answer.

## Testing

- **Do NOT write tests during feature implementation** unless explicitly asked. Complete the feature first, test later.
- Focus on **integration tests** that test entire flows, not unit tests for individual functions.

### Running Tests

We write tests exclusively using Node.js test runner.

```sh
node --test path/to/package/test/file.test.ts
```

### Test Import Rules

- **Always use package module specifiers** in test files, not relative source paths:

  ```typescript
  // ✅ CORRECT
  import { tables, Sqlite } from '@deepagents/serverize';

  // ❌ WRONG - causes type mismatches
  import { tables } from './index.ts';
  ```

- **Why**: TypeScript treats private class members (`#field`) as unique per class declaration. Mixing imports from built packages and source files creates two incompatible types.
