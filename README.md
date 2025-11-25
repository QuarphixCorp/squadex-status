
# Fettle 💟 

**Fettle** is the open-source status page, powered entirely by GitHub Actions, Issues, and Pages.

<img src="./public/ss.png" />


# Usage
First of all, you need to fork this repository.

## Update URL's
Update the urls and name in `urls.cfg` file present in `public > urls.cfg` file.

```text
Google=https://google.com
Facebook=https://facebook.com
```

## Incidents URL update
Go to `src > incidents > hooks > useIncidents.tsx` file and update the url with your repository url.

Replace **mehatab/fettle** with your **username/repo-name**
```
https://api.github.com/repos/QuarphixCorp/squadex-status/issues?per_page=20&state=all&labels=incident
```

## Service status URL update
Go to `src > services > hooks > useServices.tsx` file and update the url with your repository url.

Replace **mehatab/fettle** with your **username/repo-name**
```
https://raw.githubusercontent.com/QuarphixCorp/squadex-status/main/public/status/${key}_report.log
```

Go to `src > services > hooks > useSystemStatus.tsx` file and update the url with your repository url.

Replace **mehatab/fettle** with your **username/repo-name**
```
https://raw.githubusercontent.com/QuarphixCorp/squadex-status/main/public/status/${key}_report.log
```

## Deployment setup

Then, you need to enable GitHub Pages on your forked repository. You can do this by going to `Settings > Pages` and enabling it on the `main` branch.

In Build and deployment section select GitHub Actions.

## Change monitoring interval
If you want to change the time interval of monitoring then you can change it in `.github > workflows > health-check.yml` file.
update the cron time in the following line.

```yaml
    on:
      schedule:
        - cron: "0 0/12 * * *"
```

## Reporting your first incident
1. Go to issues tab 
2. Create a new label `incident`
3. Create a issue
4. Add the label `incident` to the issue


# How it works

- Hosting
    - GitHub Pages is used for hosting the status page.

- Monitoring
    - Github Workflow will be triggered every 1 Hr (Configurable) to visit the website.
    - Response status and response time is commited to github repository.

- Incidents
    - Github issue is used for incident management.

# Contributing
Feel free to submit pull requests and/or file issues for bugs and suggestions.
# squadEx

## Self-hosted runner (optional)

If you'd rather run builds on your own machine instead of GitHub-hosted runners, this repo includes a small helper under `actions-runner/` to configure a self-hosted runner.

- Windows helper: `actions-runner/setup-runner.ps1` — PowerShell script that downloads the official runner package, validates the SHA256 for the bundled version, extracts it, and runs `config.cmd` (it prompts for the registration token). Recommended install folder: `C:\actions-runner` to avoid long-path issues.

- Linux/macOS helper: `actions-runner/setup-runner.sh` — a small shell script (not included by default) to perform the same steps on Unix-like systems.

After configuring a runner, use labels in workflows to target it. Example (Windows):

```yaml
runs-on: [self-hosted, windows, x64]
```

Troubleshooting tips:
- Run the setup as an Administrator (Windows) or with an account that can register services.
- If Actions shows "Waiting for a runner", verify the runner is online and that the workflow's labels match the runner's labels (Repo → Settings → Actions → Runners).
- If Next.js build fails on Windows with file-lock errors, try installing the runner on a folder at the drive root and whitelist it in antivirus.
