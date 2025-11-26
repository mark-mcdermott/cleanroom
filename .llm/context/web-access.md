# Application Access

## Development Environment

### Web (SvelteKit)
- **Dev Server:** Launched via `pnpm dev`
- **URL:** http://localhost:5173 (default Vite port)
- **DevTools:** Browser developer tools (F12)

### Playwright MCP Server

This project has a Playwright MCP server configured for browser automation and testing. Agents can use it to:

**Navigation & Inspection:**
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Get accessibility tree (best for element inspection)
- `mcp__playwright__browser_take_screenshot` - Capture visual state

**Interaction:**
- `mcp__playwright__browser_click` - Click elements
- `mcp__playwright__browser_type` - Type into fields
- `mcp__playwright__browser_fill_form` - Fill multiple form fields
- `mcp__playwright__browser_select_option` - Select dropdown options
- `mcp__playwright__browser_hover` - Hover over elements

**Debugging:**
- `mcp__playwright__browser_console_messages` - View console output
- `mcp__playwright__browser_network_requests` - View network activity
- `mcp__playwright__browser_evaluate` - Run JavaScript in page

**Tab Management:**
- `mcp__playwright__browser_tabs` - List, create, close, or select tabs
- `mcp__playwright__browser_close` - Close the browser

Use Playwright MCP for:
- Interactive test development and debugging
- Visual verification of UI changes
- Exploratory testing
- Debugging E2E test failures
- Verifying accessibility tree structure

### Desktop (Tauri)
- **Dev Mode:** Launched via `pnpm tauri dev`
- **DevTools:** Available in Tauri webview (right-click → Inspect)
- **Logs:** Terminal output + Tauri console

### Mobile (Capacitor)
- **iOS:** `pnpm cap open ios` → Run in Xcode
- **Android:** `pnpm cap open android` → Run in Android Studio
- **Live Reload:** `pnpm cap run ios --livereload` or `--livereload-url`

## Database Access

### Local Development (Supabase)
- **Dashboard:** http://localhost:54323 (when `pnpm supabase start` is running)
- **API URL:** http://localhost:54321
- **Studio:** http://localhost:54323/project/default

### Production (Supabase Cloud)
- **Dashboard:** https://app.supabase.com
- **API URL:** Configured in environment variables

## External Services

### GitHub API
- Used for blog publishing
- Requires GitHub personal access token
- Store token in Supabase or secure storage

### Vercel API (Optional)
- For triggering deployments
- May require Vercel API token

## Security Notes

- Store credentials in Supabase Auth or OS keychain (Tauri)
- Never commit tokens or secrets to repository
- Use environment variables for development testing
- `.env.local` is gitignored for local overrides
