# Frontend Tools & Migration Scripts

This directory contains **utility scripts** used for code migration and maintenance tasks. These are **NOT** part of the application build.

## 📋 Scripts

### `converter.mjs`

**Purpose**: CSS Migration Utility (One-Time Use)

This script was used to **automatically convert inline React styles to Tailwind CSS classes**. It's a development utility that modifies source files.

#### How It Works:
- Scans all `.jsx` and `.js` files in `src/` directory
- Identifies inline `style={{}}` attributes
- Maps CSS properties to Tailwind classes
- Rewrites files with converted styles
- Preserves complex styles that can't be converted

#### When to Use:
- ✅ During initial Tailwind migration (already completed)
- ❌ NOT meant to run during normal development
- ❌ NOT part of the production build
- ❌ Should not be imported into component files

#### How to Run (if needed):
```bash
cd Frontend
node tools/converter.mjs
```

#### Important Notes:
- ⚠️ Creates backups of modified files (if you need to undo)
- ⚠️ Only converts standard CSS properties (complex transforms/animations are kept as inline)
- ⚠️ Read all files it will modify before running
- 📝 After migration, this file can be archived or deleted

#### Style Mappings:
The converter includes mappings for:
- Layout: `display`, `flexDirection`, `alignItems`, `justifyContent`
- Spacing: `gap`, `padding`, `margin`
- Typography: `fontWeight`, `fontSize`, `textAlign`, `lineHeight`
- Colors: SLIIT custom colors (`--sliit-navy`, `--sliit-orange`, `--sliit-green`)
- Borders: `borderRadius`, `border`
- Sizing: `maxWidth`, `width`, `height`
- Effects: `opacity`, `position`, `overflow`

---

## 🚫 Why This Isn't in the Main App:

These scripts use **Node.js File System APIs** (`fs`, `path`), which:
- ❌ Don't work in browsers (your app runs in browsers)
- ❌ Should never be bundled with production code
- ❌ Could break your build if imported incorrectly
- ✅ Belong ONLY in development/migration tools

## 📦 .gitignore Status:

Consider adding to `.gitignore` if keeping archived:
```
tools/converter.mjs  # One-time migration utility
tools/*.log          # Tool output logs
```

---

**Migration Status**: ✅ Complete - Converter script no longer needed for daily development
