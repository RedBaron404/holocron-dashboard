# Drive Approvals — Go / No-Go

**Status:** Pending Workspace tier verification (AC-12)

## Fallback (manual approval tracking)

When Drive Approvals API returns `403` or is unavailable:

1. Agent sets Policy Register `status=In Review`
2. Agent sends notification to `approver` with Doc link
3. Human approves in Workspace manually
4. Human or agent marks `status=Approved` via API after confirmation
5. Agent runs `exportDocToPDF` and archives

No [YOUR_GRC_PLATFORM] or third-party approval tool required.

## Verification command

```bash
./scripts/verify-integrations.sh --approvals
```
