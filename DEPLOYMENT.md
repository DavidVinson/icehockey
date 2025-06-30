# Fly.io Deployment Guide

This guide will help you deploy the Hockey Rink Ice Depth Heat Map Visualizer to Fly.io.

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io
2. **Fly CLI**: Install the Fly.io CLI
3. **Docker**: Ensure Docker is installed and running

## Installation Steps

### 1. Install Fly.io CLI

**macOS (Homebrew):**
```bash
brew install flyctl
```

**macOS (Manual):**
```bash
curl -L https://fly.io/install.sh | sh
```

**Other systems:** Visit https://fly.io/docs/hands-on/install-flyctl/

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Initialize Your App (First Time Only)

```bash
fly launch --no-deploy
```

When prompted:
- **App name**: `hockey-rink-heatmap` (or your preferred name)
- **Region**: Choose the closest region to your users
- **Would you like to deploy now?**: No (we'll deploy manually)

### 4. Deploy Your App

```bash
fly deploy
```

### 5. Open Your App

```bash
fly open
```

## Configuration Files

The following files are included for deployment:

- **`fly.toml`**: Fly.io configuration
- **`Dockerfile`**: Container configuration using nginx
- **`nginx.conf`**: nginx server configuration
- **`.dockerignore`**: Files to exclude from Docker build

## Available Commands

```bash
# Deploy the app
npm run deploy

# View logs
npm run logs

# Check app status
npm run status

# Setup app (first time only)
npm run deploy:setup
```

## Features

- **Static File Serving**: Optimized nginx configuration
- **Gzip Compression**: Reduces file sizes for faster loading
- **Caching**: Proper cache headers for static assets
- **Security Headers**: XSS protection and other security measures
- **Health Checks**: Automatic health monitoring
- **Auto-scaling**: Scales to zero when not in use (cost-effective)

## Customization

### Change App Name

Edit `fly.toml`:
```toml
app = "your-app-name"
```

### Change Region

Edit `fly.toml`:
```toml
primary_region = "your-preferred-region"
```

### Add Custom Domain

```bash
fly certs add yourdomain.com
```

## Troubleshooting

### View Logs
```bash
fly logs
```

### SSH into Container
```bash
fly ssh console
```

### Restart App
```bash
fly apps restart
```

### Check Status
```bash
fly status
```

## Cost Optimization

This deployment is optimized for cost:
- **Auto-scaling**: Scales to zero when not in use
- **Shared CPU**: Uses shared CPU resources
- **Minimal Memory**: 256MB RAM allocation
- **Static Files**: No server-side processing needed

## Support

For Fly.io support:
- Documentation: https://fly.io/docs/
- Community: https://community.fly.io/
- Status: https://status.fly.io/ 