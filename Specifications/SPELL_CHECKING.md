# Spell checking — medium-term priority

Planned; not implemented. Provide spell checking for prose in the desktop editor, with visible misspelling marks, suggestions, ignore/add-to-dictionary actions, language selection and an enable/disable control. Correction must be an explicit undoable edit at an exact current source range, preserving Markdown syntax, surrounding text and attribution semantics.

Exclude Markdown control syntax, code, URLs/link targets, citation keys and mathematical notation from prose checking. Establish fixtures for Unicode, contractions, proper names, multilingual passages and common academic vocabulary. User dictionary ownership, language variants and persistence need an explicit design before release; do not assume the operating system/browser supplies a consistent dictionary.

Use a local checking/dictionary path as the baseline. Do not transmit manuscript text to a third-party checking service or store sensitive prose in plaintext diagnostics/caches. Respect trusted-server/client-held execution and core egress policy. Review dictionary/engine licenses, packaging, bundle size and performance before choosing dependencies; distribute release assets through the single-Rust-executable packaging path.

Acceptance must cover real editor marking/suggestions, exact corrections and undo/redo, disabled mode, protected syntax, language/dictionary behavior, stale or delayed results after edits/document switches, accessibility and no unauthorized text disclosure. The synthetic editor currently sets browser spellcheck to false and implements no spelling engine; this requirement does not claim otherwise.
