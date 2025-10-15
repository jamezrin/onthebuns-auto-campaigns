# OTA Auto Campaigns

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0+-black.svg)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)

An automated campaign management tool for "On That Ass" memberships. This application automatically applies active campaigns to all your memberships, eliminating the need for manual intervention each billing cycle.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Usage](#-usage)
- [Deployment](#-deployment)
  - [Docker](#docker)
  - [Kubernetes](#kubernetes)
- [Development](#️-development)
- [How It Works](#-how-it-works)
- [Security Considerations](#-security-considerations)
- [Contributing](#-contributing)
- [License](#-license)
- [Disclaimer](#️-disclaimer)
- [Troubleshooting](#-troubleshooting)
- [Support](#-support)

## 🔍 Overview

This TypeScript-based automation tool interacts with the API to automatically apply active campaigns to your memberships. It's designed to run as a scheduled job, ensuring you never miss out on campaign benefits.

The application:
- Authenticates with the OTA API
- Fetches all your active memberships
- Retrieves currently active campaigns
- Automatically applies campaigns to each membership
- Provides detailed logging of all operations

## ✨ Features

- **Automated Campaign Application**: Automatically applies campaigns to all memberships
- **Smart Campaign Selection**: 
  - Automatically uses the campaign if only one is active
  - Allows manual campaign selection when multiple campaigns are active
- **Dry Run Mode**: Test the application without actually applying campaigns
- **Comprehensive Logging**: Detailed Winston-based logging for monitoring and debugging
- **GraphQL Integration**: Efficient API communication using GraphQL
- **Docker Support**: Containerized deployment with multi-stage builds
- **Kubernetes Ready**: Includes CronJob manifest for scheduled execution
- **Error Handling**: Robust error handling and validation

## 📦 Prerequisites

Before running this application, ensure you have:

- [Bun](https://bun.sh) runtime (v1.0 or higher)
- An active OTA account with valid credentials
- Active memberships on the platform

## 🚀 Installation

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/jamezrin/onthebuns-auto-campaigns.git
cd onthebuns-auto-campaigns
```

2. Install dependencies:
```bash
bun install
```

3. Configure environment variables (see [Configuration](#️-configuration))

4. Run the application:
```bash
bun start
```

### Building from Source

To create a standalone binary:

```bash
bun run build
```

This will generate a compiled binary at `out/onthebuns-auto-campaigns-bin`.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file or set the following environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ONTHATASS_EMAIL` | ✅ Yes | - | Your OnTheBuns account email |
| `ONTHATASS_PASSWORD` | ✅ Yes | - | Your OnTheBuns account password |
| `ONTHATASS_CAMPAIGN_ID` | ❌ No | - | Specific campaign ID to use (overrides automatic selection) |
| `ONTHATASS_DRY_RUN` | ❌ No | `false` | Set to `true` to simulate actions without applying campaigns |

### Example Configuration

```bash
# Required credentials
ONTHATASS_EMAIL=your.email@example.com
ONTHATASS_PASSWORD=your_secure_password

# Optional: Specify a particular campaign
ONTHATASS_CAMPAIGN_ID=12345

# Optional: Enable dry run mode for testing
ONTHATASS_DRY_RUN=true
```

## 💻 Usage

### Running Locally

```bash
# Run with default configuration
bun start

# Run with dry run mode
ONTHATASS_DRY_RUN=true bun start

# Run with specific campaign
ONTHATASS_CAMPAIGN_ID=12345 bun start
```

### Campaign Selection Logic

The application uses intelligent campaign selection:

1. **Single Active Campaign**: Automatically applied to all memberships
2. **Multiple Active Campaigns**: Requires `ONTHATASS_CAMPAIGN_ID` to be set
3. **No Active Campaigns**: Application exits with a warning

### Dry Run Mode

To test the application without making actual changes:

```bash
ONTHATASS_DRY_RUN=true bun start
```

In dry run mode, the application will:
- Authenticate and fetch data normally
- Log all actions it would perform
- Skip actual campaign application
- Display warnings indicating dry run mode

## 🐳 Deployment

### Docker

The application includes a multi-stage Dockerfile optimized for production deployments.

#### Build Docker Image

```bash
docker build -t onthebuns-auto-campaigns:latest .
```

#### Run with Docker

```bash
docker run -e ONTHATASS_EMAIL=your.email@example.com \
           -e ONTHATASS_PASSWORD=your_password \
           onthebuns-auto-campaigns:latest
```

#### Docker Compose Example

```yaml
version: '3.8'
services:
  auto-campaigns:
    image: ghcr.io/jamezrin/onthebuns-auto-campaigns:latest
    environment:
      - ONTHATASS_EMAIL=${ONTHATASS_EMAIL}
      - ONTHATASS_PASSWORD=${ONTHATASS_PASSWORD}
      - ONTHATASS_DRY_RUN=false
    restart: unless-stopped
```

### Kubernetes

The project includes a Kubernetes CronJob manifest for automated scheduled execution.

#### Deploy to Kubernetes

1. Create a secret with your credentials:

```bash
kubectl create secret generic onthebuns-auto-campaigns \
  --from-literal=ONTHATASS_EMAIL='your.email@example.com' \
  --from-literal=ONTHATASS_PASSWORD='your_password'
```

2. Apply the CronJob manifest:

```bash
kubectl apply -f k8s.manifest.yaml
```

#### CronJob Schedule

The default schedule is set to run at **12:00 PM on the 15th of every month**:

```yaml
schedule: '0 12 15 * *'
```

Modify the schedule in `k8s.manifest.yaml` according to your needs. [Cron syntax reference](https://crontab.guru/).

#### Monitoring Kubernetes Jobs

```bash
# View CronJob status
kubectl get cronjobs

# View job runs
kubectl get jobs

# View logs from the latest job
kubectl logs -l job-name=onthebuns-auto-campaigns-xxxxx
```

## 🛠️ Development

### Project Setup

```bash
# Install dependencies
bun install

# Run in development mode
bun run start

# Build the project
bun run build

# Format code
bun prettier --write .
```

### Adding New Features

1. **GraphQL Queries/Mutations**: Add to `src/graphql-templates.ts`
2. **Request Functions**: Implement in `src/graphql-requests.ts`
3. **Business Logic**: Update `src/index.ts`
4. **Configuration**: Add constants to `src/constants.ts`

## 📖 How It Works

### Execution Flow

```
┌─────────────────────────────────────┐
│  1. Authentication                  │
│     - Login with credentials        │
│     - Obtain JWT token              │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  2. Fetch User Information          │
│     - Verify authenticated user     │
│     - Log user details              │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  3. Fetch Memberships               │
│     - Get all active memberships    │
│     - Display membership details    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  4. Fetch Active Campaigns          │
│     - Retrieve current campaigns    │
│     - Display campaign information  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  5. Campaign Selection              │
│     - Auto-select if one available  │
│     - Use specified campaign ID     │
│     - Exit if multiple & no ID      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  6. Apply Campaign to Memberships   │
│     - Wait 5 seconds before start   │
│     - Apply to each membership      │
│     - Wait 15 seconds between each  │
│     - Skip if dry run mode          │
└─────────────────────────────────────┘
```

### Rate Limiting

The application implements built-in delays to prevent API rate limiting:
- **5 seconds** initial delay before starting campaign application
- **15 seconds** between each membership update

## 🔒 Security Considerations

- **Credentials**: Never commit credentials to version control
- **Secrets Management**: Use Kubernetes secrets or environment variables
- **Dry Run Testing**: Always test with `ONTHATASS_DRY_RUN=true` first
- **Rate Limiting**: Built-in delays prevent API abuse
- **Token Security**: JWT tokens are stored in memory only

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

**This project is intended for educational and learning purposes only.** It is designed to demonstrate automation concepts, API integration, and GraphQL implementation using TypeScript and Bun runtime.

This tool is **not intended to**:
- Reverse engineer or exploit the "On That Ass" API
- Bypass any security measures or terms of service
- Misuse or abuse the platform in any way
- Violate any intellectual property rights

**Important Notes:**
- This is an unofficial tool and is not affiliated with, endorsed by, or connected to OnThatAss
- Users must have legitimate accounts and valid credentials
- Use of this tool must comply with the platform's Terms of Service
- The authors assume no responsibility for any misuse or violations
- Use at your own risk and discretion

By using this tool, you acknowledge that you are responsible for ensuring your usage complies with all applicable terms of service, laws, and regulations.

## 🐛 Troubleshooting

### Common Issues

**Authentication Failed**
- Verify your email and password are correct
- Ensure your account is active
- Check if the API endpoint is accessible

**No Active Campaigns Found**
- Wait until a campaign is available
- Check the OnTheBuns website for campaign dates

**Multiple Campaigns Error**
- Set the `ONTHATASS_CAMPAIGN_ID` environment variable
- Check campaign IDs from the application logs

**Rate Limiting**
- The application includes built-in delays
- If issues persist, increase delays in `src/index.ts`

## 📞 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/jamezrin/onthebuns-auto-campaigns/issues)
- Check existing issues for solutions

---
