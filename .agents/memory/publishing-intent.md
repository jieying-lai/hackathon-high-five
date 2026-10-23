---
name: Publishing intent
description: User-selected deployment type and the limit of the publishing configuration repair.
---

The user explicitly selected Autoscale for this project's publishing configuration.

**Why:** After repeated publishing-dialog target-mismatch warnings, the user confirmed the type selected in the Publishing interface. Choosing a different hosting type would change the intended operation and potentially its billing.

**How to apply:** Autoscale is the last explicit user preference, not permission to overwrite a different active deployment type during unrelated debugging. Check current deployment metadata and configuration first; preserve the active target while fixing dependencies, and clarify any mismatch with the preference before changing hosting type. Distinguish configuration validation from a successful publish: a matching file alone does not prove the dialog warning has disappeared or establish a live URL. Confirm actual deployment status before claiming success.
