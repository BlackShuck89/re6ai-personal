# Branch protection for re6AI Personal

This repository has its own changes and **must not be reset to the upstream re6AI master branch**.

GitHub does **not** automatically activate ruleset JSON files stored in a repository. Two importable rulesets are tracked here, but a repository administrator must apply them using GitHub's settings or an authenticated GitHub CLI.

## Intended policy

**master** — protect against unexpected upstream synchronization:

- No branch deletion.
- No force pushes or forced reset to upstream.
- Require a pull request for every change. No approval is required, so a single-maintainer repository is still usable; any review conversations must be resolved.
- No bypass actors are configured.

**development** — preserve our working development history:

- No branch deletion.
- No force pushes.
- Direct commits remain allowed so iterative development is not blocked.

Both policies are marked `active` in the JSON; this only becomes meaningful **after installing them**.

## Activate from GitHub website

1. Visit [repository rulesets](https://github.com/BlackShuck89/re6ai-personal/settings/rules).
2. Choose **New ruleset** → **Import a ruleset** (if offered), and import `.github/rulesets/protect-master.json` and then `.github/rulesets/protect-development.json`.
3. If import is not offered, create two **branch** rulesets manually using the policies above. Target the exact branch names `master` and `development`.
4. Set enforcement to **Active**, leave the bypass list empty, and save both.
5. Verify the two new active rulesets appear in Settings → Rules → Rulesets.

No additional reviewer approval should be required on `master` for a single-maintainer repository.

## Activate using GitHub CLI on Windows

With [GitHub CLI](https://cli.github.com/) installed, clone or check out the `development` branch and run:

```powershell
gh auth login
powershell -ExecutionPolicy Bypass -File .\scripts\apply-branch-protection.ps1
```

The script reads the JSON files and creates the two rulesets, or updates the rulesets with those exact names if they already exist. It cannot change unrelated rulesets. Your authenticated GitHub account must have repository administration permission.

## Upstream updates

The GitHub **Sync fork** control does **not** auto-update this fork. A normal merge from upstream does not inherently erase local commits, but it can replace changed file contents; a forced reset is more dangerous.

To bring in upstream improvements, review changes and open a pull request instead of resetting `master`, force-pushing, or using `gh repo sync --force`. The `development` branch should be the integration/testing area, then selected changes can be merged into `master`.

A pull request requirement does not prevent a maintainer from deliberately accepting upstream changes; it prevents **direct changes** to `master` without the reviewable PR step.
