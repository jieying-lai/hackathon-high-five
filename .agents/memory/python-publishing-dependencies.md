---
name: Python publishing dependencies
description: Non-user Python package installation and dependency-audit resolution during publishing.
---

Use a project-local package destination rather than user-site installation for both workspace setup and publishing.

**Why:** Both the package installer and the publishing bootstrap failed with “Can not perform a '--user' install. User site-packages are disabled for this Python.” Configuring non-user installation into the project's Python package directory allowed installation to succeed. The publisher's automatic installation runs before the configured build command, so changing that command alone does not address this failure.

**How to apply:** Manage the pip environment through the environment tools, keep the destination relative to the project and consistent with the configured Python version, and verify imports with user-site loading disabled. Preserve the current deployment target while repairing this independent dependency problem.

Check both the installed environment and a fresh dependency audit. Do not assume either proves the other is current.

**Why:** Patched installed libraries did not prevent the audit from flagging older versions resolved from dependency manifests. Shared constraints alone did not clear every finding; declaring the relevant PDF/HTTPS dependency floors explicitly in the consuming requirements did.

**How to apply:** Update actual dependency declarations and their compatible parents, then inspect the new audit. Keep security checks enabled and retain local/GPU features rather than hiding their manifests. Inspect advisory affected ranges when the scanner omits a suggested fixed version; that omission does not necessarily mean every newer release is affected.
