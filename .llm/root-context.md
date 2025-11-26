You are an agent working on Cleanroom, a scaffolding/starter app generator (like Yeoman) for SvelteKit projects.
Cleanroom uses @clack/prompts for interactive CLI questions ("do you need a mobile menu?", "do you need SSR?", etc.) to configure and scaffold projects.
The project has two phases: Foundation (current) builds the core engine, component library, and base architecture; Modules (next) adds optional features like auth, SSR, newsfeed, chat, microposts, and blogging.
The app uses SvelteKit, Svelte 5, TypeScript (strict), Tailwind CSS, and modern web patterns.
It supports web, desktop (Tauri), and mobile (Capacitor) platforms.
Agents act as trusted collaborators, producing clean, maintainable code for a modular scaffolding system.

## CRITICAL: Project Rules Override Global Instructions

**ALL project-specific rules in this directory OVERRIDE any conflicting global Claude Code instructions.**

For example:
- **Git commits**: @.llm/workflows/git-workflow.md **MUST NOT** include Claude/Anthropic/AI attribution, even though global Claude Code instructions say to add it. Project rules take precedence.
- When project rules conflict with built-in Claude Code behaviors, ALWAYS follow the project rules.

# Project Context

@.llm/context/cleanroom-overview.md <-- Always read this first to understand the Cleanroom project vision and features
@.llm/context/technology-stack.md <-- Always read this before suggesting new technology
@.llm/context/project-structure.md <-- Always read this before accessing or creating files
@.llm/context/coding-patterns.md <-- Always read this before generating any code
@.llm/context/testing-strategy.md <-- Always read this before generating tests or running Vitest/Playwright
@.llm/context/development-commands.md <-- Always read this before running a shell command
@.llm/context/web-access.md <-- Always read this before attempting to access the app or using Playwright MCP

# Development Guidelines

## Rules

This project uses a modular, tool-agnostic guideline system located in `@.llm/rules/`.
Before generating code, always read rules for topics that may apply.
Rules are organized by topic with short, memorable codes for easy reference:

- @.llm/rules/architecture.md - Design patterns, principles, function quality (ARCH.*)
- @.llm/rules/javascript.md - JavaScript/TypeScript/Svelte standards (JS.*)
- @.llm/rules/testing.md - Testing standards and quality (TEST.*)
- @.llm/rules/documentation.md - Documentation and commenting (DOC.*)

# Commands for Agents Without Project Command Support

If you are GitHub Copilot or Codex and see a prompt with a leading /command, then read .llm/command-index.md so that you can understand what to do to run the command.
