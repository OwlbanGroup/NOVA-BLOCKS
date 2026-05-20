# GitHub Secrets Setup Guide

This guide explains how to configure the required secrets for the deployment workflow.

## Required Secrets

The deploy.yml workflow requires 5 secrets to be configured in your GitHub repository:

| Secret Name            | Description                         | Required For                          |
| ---------------------- | ----------------------------------- | ------------------------------------- |
| `DOCKER_HUB_USERNAME`  | Your Docker Hub username            | Building and pushing Docker images    |
| `DOCKER_HUB_TOKEN`     | Docker Hub access token             | Authenticating to Docker Hub          |
| `DEPLOY_HOST`          | Target server hostname/IP           | SSH connection for deployment         |
| `DEPLOY_USER`          | SSH username for deployment         | Server authentication                 |
| `DEPLOY_KEY`           | SSH private key                     | Secure server access                  |

---

## Step-by-Step Setup Instructions

### Step 1: Navigate to GitHub Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, expand **Secrets and variables**
4. Click on **Actions**

### Step 2: Add Each Secret

For each secret:

1. Click **New repository secret** button
2. Enter the secret name (exact match required)
3. Enter the secret value
4. Click **Add secret**

---

### Step 3: Get Values for Each Secret

#### DOCKER_HUB_USERNAME

- Your Docker Hub account username
- If you don't have an account, create one at <https://hub.docker.com>

#### DOCKER_HUB_TOKEN

1. Go to <https://hub.docker.com/settings/security>
2. Click **New Access Token**
3. Give it a descriptive name (e.g., "github-actions-deploy")
4. Select appropriate permissions (push/read/write)
5. Copy the generated token immediately (it won't be shown again)

#### DEPLOY_HOST

- The public IP address or hostname of your deployment server
- Example: `192.168.1.100` or `nova-blocks.yourdomain.com`
- **Note:** Ensure port 22 is open for SSH

#### DEPLOY_USER

- The SSH username on your deployment server
- Common options: `root`, `ubuntu`, `deploy`, or a specific user

#### DEPLOY_KEY

1. On your local machine, generate a new SSH key pair:

   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f deployment-key
   ```

2. Add the **private key** content as the secret (entire file including `-----BEGIN OPENSSH PRIVATE KEY-----`)
3. Add the **public key** to your server's `~/.ssh/authorized_keys` file

---

## Security Best Practices

### For Deployment Key

- Use a dedicated SSH key pair for GitHub Actions
- Restrict the key permissions on the server (use `chmod 700` for .ssh, `chmod 600` for keys)
- Consider using a separate deployment user with limited permissions (not root)
- Add the public key only for the deployment user, not root

### For Docker Hub Token

- Use a unique token for GitHub Actions
- Regularly rotate the token
- Set appropriate expiration if available

---

## Testing the Setup

After adding all secrets, you can test by:

1. Going to the **Actions** tab in your repository
2. Selecting the **Deploy to Production** workflow
3. Clicking **Run workflow**
4. Watching the workflow execution for any errors

---

## Troubleshooting

### Common Issues

| Error                            | Solution                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| "Context access might be invalid" | This is just VSCode not finding the secrets locally - they work in GitHub              |
| "Authentication failed"           | Check DOCKER_HUB_USERNAME and DOCKER_HUB_TOKEN are correct                          |
| "Connection refused"            | Check DEPLOY_HOST and ensure SSH port 22 is open                                   |
| "Permission denied (publickey)" | Verify DEPLOY_KEY is correctly added to server's authorized_keys                   |

### Verify Secrets are Set

- Go to: Repository → Settings → Secrets and variables → Actions
- Secrets will show with masked values (••••••••)
- If a secret shows "No secrets set", it hasn't been added yet

---

## Notes

- The VSCode warnings about "Context access might be invalid" are **expected** - these are local diagnostics that can't access your GitHub secrets
- The workflow will work correctly once secrets are configured in GitHub
- Secrets are encrypted and only accessible to GitHub Actions
- Never commit secret values to the repository

---

## Files Using These Secrets

- `.github/workflows/deploy.yml` - Main deployment workflow
