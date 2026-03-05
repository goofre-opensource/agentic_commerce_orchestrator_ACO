# GitHub Branch Protection Guidelines (SOP)

As part of the Goofre Quality Standard, the `main` branch **must** be locked down to prevent direct commits and enforce passing CI checks.

Since automatic provisioning via the `gh` CLI is currently unavailable in the deployment environment, **Repository Administrators must apply these settings manually in the GitHub UI**.

## Instructions for Administrators

1. Navigate to your repository on GitHub.
2. Click **Settings** > **Branches**.
3. Under **Branch protection rules**, click **Add rule**.
4. Set the **Branch name pattern** to `main`.
5. Enable the following settings:
   - [x] **Require a pull request before merging**
     - [x] Require approvals (Set to 1)
     - [x] Dismiss stale pull request approvals when new commits are pushed
   - [x] **Require status checks to pass before merging**
     - [x] Require branches to be up to date before merging
     - _Search and select the following status checks:_
       - `Lint & Type Check`
       - `Integration Tests`
       - `Build Packages`
   - [x] **Do not allow bypassing the above settings**
   - [x] **Enforce all configured restrictions for administrators** (Highly recommended to prevent accidental pushes by admins).

6. Click **Create** to save the rule.

This ensures that all code entering the 'main' branch of the Agentic Commerce Orchestrator is peer-reviewed, strictly typed, and verified by passing integration tests.
