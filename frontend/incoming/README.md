# Sites export inbox

Put the complete exported files in **[sites-export/](sites-export/)**. You may place a ZIP archive there or extract the export directly into it. Preserve the original directory structure, including source files, images/fonts/styles, package manifests/lockfiles and license notices. An exported README belongs inside sites-export, where it will not replace these instructions.

This inbox is local reference material. Its contents are ignored by Git, apart from the empty folder marker, so uploading does not publish an unreviewed export. Keep the raw export intact; reviewed/adapted application code will be introduced separately under frontend.

The export is a design/code input, not a canonical architecture or an automatically trusted startup script. Review its dependencies, licenses, entry points, fixtures and application-service assumptions before running or adopting it. Use the [frontend integration specification](../../Specifications/FRONTEND_INTEGRATION.md) and [evaluation](../../docs/reviews/0008-frontend-integration.md) to decide what to retain, refactor or replace.

See [frontend development](../README.md) for the intended local-runtime and integration workflow.
