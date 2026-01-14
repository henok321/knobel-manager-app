# MCP Setup Guide for Knobel Manager App

## Current Status

✅ **Playwright MCP tools are available** - MCP server appears to be configured
❌ **Playwright browser not installed** - Need to install Chrome browser for Playwright

## MCP Configuration

### Claude Code MCP Configuration

Claude Code MCP servers are configured in your Claude settings. Based on the available tools, Playwright MCP is already configured.

**Expected Configuration Location:**
The MCP configuration should be in one of these locations:

- `~/.config/claude/config.json`
- `~/Library/Application Support/Claude/config.json`
- Via Claude Code Settings UI

**Required Configuration:**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"]
    }
  }
}
```

## Browser Installation Issue

The error we're encountering:

```
Error: browserType.launchPersistentContext: Chromium distribution 'chrome' is not found
Run "npx playwright install chrome"
```

### Solution Options

#### Option 1: Install Playwright as Project Dependency (Recommended)

Add Playwright to the project so browser management is easier:

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install chromium

# Or install specific browser
npx playwright install chrome
```

#### Option 2: Use Playwright MCP Browser Install

The MCP should handle browser installation, but it requires user permissions. When you run:

```
mcp__playwright__browser_install
```

You may need to approve the installation in Claude Code.

#### Option 3: Manual Browser Installation

If you have Chrome installed at a custom location, the Playwright MCP might need to be configured to find it.

## Verification Steps

Once the browser is installed, verify MCP is working:

### 1. Navigate to a URL

```
mcp__playwright__browser_navigate("https://localhost:5173/login")
```

### 2. Take a Screenshot

```
mcp__playwright__browser_take_screenshot()
```

### 3. Get Page Snapshot

```
mcp__playwright__browser_snapshot()
```

## Current Development Server

✅ Development server is running at: **https://localhost:5173/**

Started with: `npm run prod`

## Next Steps

1. ✅ MCP is configured (tools are available)
2. ⏳ Install Playwright browser
3. ⏳ Test navigation to https://localhost:5173/login
4. ⏳ Begin UI/UX analysis

## Troubleshooting

### If MCP tools are not available

Check Claude Code settings:

1. Open Claude Code settings
2. Look for MCP Servers configuration
3. Add Playwright MCP configuration if missing

### If browser installation fails

Try installing Chrome manually:

- Download from https://www.google.com/chrome/
- Or use Chromium: `npx playwright install chromium`

### Permission Issues

The MCP browser install might require:

- User approval in Claude Code
- System permissions for installation
- Sudo access (which Claude Code can't provide)

## Alternative Approach

If Playwright MCP continues to have issues, we can:

1. Use Playwright directly via npm scripts
2. Create manual UI testing workflows
3. Use browser DevTools for analysis
4. Proceed with refactoring based on code exploration (already completed)

## What We Already Know

Even without Playwright, we've identified key UI/UX issues through code exploration:

- ✅ Accessibility gaps
- ✅ Inconsistent styling
- ✅ Form UX issues
- ✅ Mobile experience gaps
- ✅ Performance opportunities

We can proceed with refactoring based on this analysis.
