---
name: Python publishing dependencies
description: Non-user Python package installation and dependency-audit resolution during publishing.
---

Use a project-local package destination rather than user-site installation for both workspace setup and publishing.

**Why:** Both the package installer and the publishing bootstrap failed with “Can not perform a '--user' install. User site-packages are disabled for this Python.” Non-user environment settings fixed the workspace installer but subsequent hosted builds still failed in the automatic installation step, before the configured build command. Production-scoped pip environment settings alone did not fix that step.

**How to apply:** Use the documented hosting-packager setting to replace only the implicit package-installation step with an explicit web dependency build. Pass non-user installation and a project-local target as command-line options, rather than relying only on environment inheritance; derive the Python package directory from the active interpreter. Keep the package firewall and security scan enabled. Test with user sites disabled; Nix can also reject a missing install target as an externally managed environment. A successful local regression test is not confirmation of a successful hosted build. Preserve the current deployment target while repairing this independent dependency problem.

Check both the installed environment and a fresh dependency audit. Do not assume either proves the other is current.

**Why:** Patched installed libraries did not prevent the audit from flagging older versions resolved from dependency manifests. Shared constraints alone did not clear every finding; declaring the relevant PDF/HTTPS dependency floors explicitly in the consuming requirements did.

**How to apply:** Update actual dependency declarations and their compatible parents, then inspect the new audit. Keep security checks enabled and retain local/GPU features rather than hiding their manifests. Inspect advisory affected ranges when the scanner omits a suggested fixed version; that omission does not necessarily mean every newer release is affected.
