# Portfolio Privacy Checklist

Use this checklist before publishing the project.

- Replace all company names, logos, and screenshots with neutral demo branding.
- Use only synthetic/demo data (never production records or employee/customer names).
- Keep `.env` out of Git and rotate any old secrets before reuse.
- Review generated links and public URLs (`NEXT_PUBLIC_*`) for internal hostnames.
- Remove exported HTML/debug files that may contain old paths or sensitive metadata.
- Verify no credentials/tokens appear in commit history, logs, or screenshots.

