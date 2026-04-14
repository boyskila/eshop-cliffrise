---
name: coding-style
description: >
  Enforces personal JavaScript and TypeScript coding style preferences whenever Claude writes, edits, or reviews JS/TS code. Always apply this skill when writing any JavaScript or TypeScript code, including React components, Astro components, utility functions, API routes, or any other JS/TS files. Apply automatically — do not wait to be asked. Current rules: prefer arrow functions over regular function declarations, const over let, curly braces for multi-line function bodies, implicit return for one-liners, descriptive variable names.
---

# Coding Style Skill

Enforces the user's personal JS/TS coding style preferences on all code Claude writes or modifies.

---

## Rules

### 1. Arrow Functions over Regular Functions

**Always use arrow functions instead of regular `function` declarations.**

❌ Avoid:
```js
function add(a, b) {
  return a + b;
}

function handleClick(event) {
  console.log(event);
}
```

✅ Prefer:
```js
const add = (a, b) => a + b;

const handleClick = (event) => {
  console.log(event);
};
```

**Exceptions (do NOT convert to arrow functions):**
- Generator functions (`function*`) — cannot be arrow functions
- Class methods — arrow functions in classes are fine but not required

---

### 2. `const` over `let`

**Always use `const` by default. Only use `let` when the variable needs to be reassigned.**

❌ Avoid:
```js
let name = 'John';
let items = [];
let count = 0; // if count is never reassigned
```

✅ Prefer:
```js
const name = 'John';
const items = [];
let count = 0; // only if count is reassigned later e.g. count++
```

**Rules:**
- `const` for all variables that are never reassigned
- `const` for arrays and objects (even if their contents change — the reference stays the same)
- `let` only when the variable is explicitly reassigned (loops, counters, accumulators)
- Never use `var`

---

### 3. Curly Braces for Multi-line Function Bodies

**Use curly braces `{}` when the function body spans multiple lines.**

❌ Avoid:
```js
const process = (data) =>
  data
    .filter(x => x.active)
    .map(x => x.value);
```

✅ Prefer:
```js
const process = (data) => {
  return data
    .filter(x => x.active)
    .map(x => x.value);
};
```

---

### 4. Implicit Return for One-liners

**Skip curly braces and `return` when the entire function fits on one line.**

❌ Avoid:
```js
const double = (x) => {
  return x * 2;
};

const getName = (user) => {
  return user.name;
};
```

✅ Prefer:
```js
const double = (x) => x * 2;

const getName = (user) => user.name;
```

**Decision rule — use implicit return when:**
- The entire expression fits comfortably on one line (~80 chars)
- There is only one expression to return (no intermediate variables)

**Use curly braces + explicit return when:**
- The function has multiple statements
- There are intermediate variables
- The expression is too long for one line

---

### 5. Descriptive Variable Names

**Always use clear, descriptive names. Never use single-letter or cryptic abbreviations.**

❌ Avoid:
```js
const ta = document.querySelector('textarea');
const btn = document.getElementById('submit');
const cb = (e) => console.log(e);
const res = await fetch('/api');
const el = document.querySelector('.card');
const msg = 'Hello';
const val = input.value;
```

✅ Prefer:
```js
const textArea = document.querySelector('textarea');
const submitButton = document.getElementById('submit');
const handleChange = (event) => console.log(event);
const response = await fetch('/api');
const cardElement = document.querySelector('.card');
const message = 'Hello';
const inputValue = input.value;
```

**Rules:**
- Names should convey meaning at a glance — a reader shouldn't need to look up what a variable holds
- Use camelCase with full words: `officeNameElement`, not `offNameEl`
- Loop iterators (`i`, `j`) and arrow-function parameters in short callbacks (`x => x * 2`) are acceptable exceptions
- Common well-known abbreviations are fine when unambiguous in context: `id`, `url`, `api`, `db`, `config`, `params`, `props`

---

### 6. `if/else` with Curly Braces over Inline Conditionals

**Always use `if/else` blocks with curly braces. Avoid short-circuit evaluation (`&&`, `||`) for control flow. Ternary operators are preferred for value assignments.**

❌ Avoid:
```js
isValid && doSomething();
hasError || setDefault();
if (done) return;
const label = condition ? (isAdmin ? 'Admin' : 'User') : 'Guest';
```

✅ Prefer:
```js
if (isValid) {
  doSomething();
}

if (!hasError) {
  setDefault();
}

if (done) {
  return;
}

const value = condition ? 'yes' : 'no';
const label = isActive ? 'On' : 'Off';
```

**Rules:**
- Ternary operators are preferred for simple value assignments: `const x = condition ? a : b`
- Only one level of ternary nesting — never nest ternaries inside ternaries
- Nullish coalescing (`??`) and optional chaining (`?.`) are fine — they are value expressions, not control flow
- Default values: `const name = input ?? 'default'` is acceptable
- Short-circuit `&&` / `||` for control flow (side effects) is not allowed — use `if` blocks instead
- All `if/else` blocks must use curly braces, even for single statements

---



## Quick Reference

| Situation | Style |
|---|---|
| Simple one-liner | `const fn = (x) => x * 2` |
| Multi-line body | `const fn = (x) => { return ... }` |
| Variable never reassigned | `const x = 1` |
| Variable reassigned | `let x = 1` |
| Naming | `textArea` not `ta`, `submitButton` not `btn` |
| Conditionals | `if (x) { ... }` not `x && doThing()`, ternaries OK |
| Regular function | ❌ convert to arrow |
| `var` | ❌ never use |

---

## How to Apply

- When **writing new code**: follow all rules above by default
- When **editing existing code**: apply rules to any code in the scope you're touching
- When **reviewing code**: flag violations and suggest corrections