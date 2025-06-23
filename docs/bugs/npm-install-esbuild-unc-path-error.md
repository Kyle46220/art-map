# Bug Report: npm install Failure - esbuild UNC Path Error

**Date:** June 21, 2025  
**Environment:** WSL2 Ubuntu on Windows  
**Status:** ✅ RESOLVED  

## Problem Summary

The `npm install` command was failing during the esbuild package installation with a UNC path error. The installation process would crash when esbuild's post-install script attempted to run, preventing the project from being set up properly.

## Error Details

### Primary Error Message
```
npm error code 1
npm error path \\wsl.localhost\Ubuntu\home\kyle46220\webdev\art-map\node_modules\esbuild
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c node install.js
npm error '\\wsl.localhost\Ubuntu\home\kyle46220\webdev\art-map\node_modules\esbuild'
npm error CMD.EXE was started with the above path as the current directory.
npm error UNC paths are not supported.  Defaulting to Windows directory.
npm error node:internal/modules/cjs/loader:1228
npm error   throw err;
npm error   ^
npm error
npm error Error: Cannot find module 'C:\Windows\install.js'
```

### Technical Analysis

**Root Cause:** WSL was using the Windows installation of Node.js and npm instead of a native Linux version.

**Investigation Results:**
- `which node` → (empty - no native Linux node)
- `which node.exe` → `/mnt/c/Program Files/nodejs/node.exe`
- `which npm` → `/mnt/c/Program Files/nodejs/npm`
- Node version: `v22.14.0` (Windows build)

**Why This Failed:**
1. Windows npm runs package scripts through `cmd.exe`
2. When cmd.exe tries to use the WSL path `\\wsl.localhost\Ubuntu\home\kyle46220\webdev\art-map\...` as working directory, it fails because Windows shells don't support UNC paths as working directories
3. cmd.exe defaults to `C:\Windows` instead
4. The esbuild install script looks for `install.js` in the wrong location (`C:\Windows\install.js`)
5. Installation crashes with MODULE_NOT_FOUND error

## Resolution Steps

### 1. Install Native Linux Node.js via nvm
```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install and use LTS Node.js
nvm install --lts
nvm use --lts
```

### 2. Verify Native Installation
```bash
which node  # → /home/kyle46220/.nvm/versions/node/v22.16.0/bin/node
which npm   # → /home/kyle46220/.nvm/versions/node/v22.16.0/bin/npm
node -v     # → v22.16.0 (Linux build)
npm -v      # → 10.9.2
```

### 3. Prevent Windows Node Interference
Added to `~/.bashrc`:
```bash
# Remove Windows Node from PATH inside WSL
export PATH=$(echo "$PATH" | tr ":" "\n" | grep -v "/mnt/c/Program Files/nodejs" | paste -sd:)
```

### 4. Clean Installation
```bash
# Remove failed installation artifacts
rm -rf node_modules package-lock.json

# Reinstall with native Linux npm
npm install
```

## Results

✅ **Installation Successful:**
```
added 94 packages, and audited 95 packages in 25s
13 packages are looking for funding
2 moderate severity vulnerabilities
```

✅ **Development Server Working:**
```
VITE v5.4.19  ready in 398 ms
➜  Local:   http://localhost:3000/
```

## Key Learnings

1. **Cross-Platform Path Issues:** UNC paths (`\\wsl.localhost\...`) are not supported as working directories in Windows command shells
2. **Tool Chain Consistency:** Using Windows Node.js tools in WSL can cause compatibility issues with packages that have native build steps
3. **esbuild Sensitivity:** esbuild's post-install script is particularly sensitive to path and shell environment issues
4. **nvm Benefits:** Using nvm provides better isolation and version management for Node.js in development environments

## Prevention

- Always use native Linux Node.js installations in WSL environments
- Configure PATH to prioritize Linux binaries over Windows binaries in WSL
- Use nvm for Node.js version management in development environments
- Test npm install immediately after environment setup to catch path issues early

## Related Issues

This type of error commonly affects packages with:
- Native compilation steps
- Post-install scripts that interact with the file system
- Binary dependencies that need to match the runtime environment

## Environment Details

- **OS:** Linux 5.15.167.4-microsoft-standard-WSL2
- **Shell:** /bin/bash
- **Node.js (Before):** v22.14.0 (Windows)
- **Node.js (After):** v22.16.0 (Linux LTS)
- **npm (Before):** Windows version
- **npm (After):** 10.9.2 (Linux)
- **Project:** React + Vite application with esbuild dependency 