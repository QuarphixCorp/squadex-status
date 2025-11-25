# Self-hosted Actions runner helper

This folder contains a small PowerShell helper to download and configure a GitHub Actions self-hosted runner on Windows.

Important: do NOT commit or paste your registration token into the repo. The script below will prompt for the token.

Quick steps (PowerShell, run as Administrator):

1. Create and change into the folder recommended for the runner (root of a drive avoids long path issues):

```powershell
mkdir C:\actions-runner
cd C:\actions-runner
```

2. Copy this `setup-runner.ps1` into the directory and run it. The script will:
- download the runner package (configurable version)
- optionally verify the SHA256 checksum
- extract the runner
- run `config.cmd` and prompt you for the registration token

Run the script:

```powershell
# Run in PowerShell (preferably as Administrator)
.\setup-runner.ps1
```

During configuration the script will ask for the repository URL and the registration token. Provide the token from:

GitHub → Settings → Actions → Runners → Add runner → Generate token

Recommended labels to use in workflows for a Windows runner:

  runs-on: [self-hosted, windows, x64]

Notes & troubleshooting
- Run PowerShell as Administrator to avoid permission issues when installing the runner service.
- Installing under a drive root (e.g., `C:\actions-runner`) helps avoid Windows long path problems.
- If antivirus locks the `.node` binary (common with `next`), either whitelist the runner folder or pause the antivirus during install.
- To run the runner as a service (so it starts automatically), use the `svc.sh`/`svc.cmd` helper provided after configuration.

If you want, I can also create a small script for Linux/macOS or adjust the labels to match your existing runner.
