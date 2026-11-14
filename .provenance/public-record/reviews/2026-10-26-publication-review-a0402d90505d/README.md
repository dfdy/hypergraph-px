# Personal-data, confidentiality and licensing review

Reviewed 2026-10-26. Scope: the [pre-integration snapshot](../../public-snapshots/2026-10-26-pre-architecture-integration-a0402d90505d/README.md), its 327 payload files (12,888,115 bytes) and nine control files. This review is supplementary evidence outside that immutable archive. It authorizes no publication and changes no licence.

## Subsequent publication authorization

After this review, the owner instructed: **“Redact what's needed and push to github.”** The linked snapshot is now the approved public derivative. Three JSON reports have local browser/cache prefixes replaced; 324 payloads and all nine historical controls retain their original bytes. The private master remains excluded from Git. Historical review conclusions below describe the earlier review state. Existing licences remain unchanged; rights confirmation and this distribution instruction do not create a blanket reuse licence. See the [publication record](../../../../docs/09-guides/reference/documentation-publication-2026-10-26.md).

## Result

**Review complete; publication remains held.** No credential-pattern matches, private-key blocks, participant records or private manuscript bodies were identified in the reviewed scope. Three renderer reports disclose local paths. A public derivative should redact those paths, retain third-party attribution and state the licence scope for supplied material. The historical master must remain byte-for-byte unchanged, including its original readiness statement.

This conclusion combines a bounded text-pattern scan, provenance/coverage-register inspection, review of the retained licensing policy and dependency/asset inventories, and visual inspection of all 12 PNGs. It is not an arbitrary-secret detector, full semantic review of every sentence, legal opinion, or application security audit. No excluded inputs, personal configuration, runtime databases, credentials or private originals were opened for this review. No application build/test or runtime refresh was needed.

## Owner rights confirmation

The owner explicitly answered: **“I created them or hold redistribution rights for all three.”** The question identified (1) supplied HPX prose/design inputs, (2) the documentation-template pack and (3) the logo. Record this as an owner attestation, not independent verification of authorship or a signed assignment. It resolves the previous absence of redistribution provenance for these categories. It does not transfer ownership, choose a new public licence, grant unrelated dependency rights or authorize publication.

The logo is the canonical `docs/assets/logo.png`, SHA-256 `35137d064146164b7a7a227e3c9a82e31b0ec2e8634d6869e02ba16858c9b9ae`. The supplied pack is source HPX-SRC-0118; its retained design input is HPX-SRC-0119. Original ignored archives remain excluded. Nothing here grants permission to publish private manuscripts, user content or workspace data.

## Personal data and confidentiality

| Finding | Evidence and disposition |
| --- | --- |
| Local home/cache paths | 52 occurrences in three payload JSON files, across nine JSON string fields. Home paths expose a local account identifier; temporary paths expose machine-specific cache identifiers. Redact in a separately approved derivative. Exact relative locations and JSON pointers are in [scan-results.json](scan-results.json), without repeating the sensitive values. |
| Contact and network candidates | Both email-pattern matches are the Mermaid release tag in a URL, not addresses. Of 1,955 IPv4-pattern matches, 25 are loopback `127.0.0.1`; the remainder occur in SVG geometry and the viewer's embedded SVG data. No non-loopback endpoint was identified among these matches. |
| Credentials | No matches for private-key headers, supported GitHub/OpenAI/AWS token patterns, credentials in HTTP URLs, or quoted secret assignments. Certificate fingerprints, source hashes, public repository handles, localhost ports and dependency integrity strings are public technical metadata, not private keys. Pattern absence is not proof that every possible secret encoding is absent. |
| Images | Both application previews show synthetic/demo writing, not a real manuscript or participant record. The logo has no personal text. Five contact sheets, three detailed diagrams and the viewer screenshot contain technical architecture material. All 12 were visually inspected; this was human visual review, not automated OCR. |
| Image metadata | All PNG chunks were enumerated. No `tEXt`, `zTXt`, `iTXt` or `eXIf` chunks occur. The logo has a standard sRGB ICC profile and physical-resolution metadata; its decompressed profile contains no identifying text found in inspection. Other chunks are structural/image data. |
| Private source references | Source registers retain filenames, headings, hashes, dates, project history and clearance classifications. A reference to an ignored source does not include its body or grant access. These disclose project provenance and topics, so retain them only within the eventual approved distribution scope. No arbitrary extraction of private originals is recommended. |
| External study fixtures | HPX-SRC-0082–0087 remain restricted source metadata. No rows in `claims.csv` or `claim-coverage.csv` import their passages; `source-sections.csv` retains 83 section entries, including philosophical/mathematical headings for 0086/0087. Their manuscript/fixture bodies are absent. The owner's rights answer does not silently reclassify these source rows or authorize ignored originals. |
| Confidential implementation history | The archive intentionally includes unfinished capability limits, trust decisions, public leaf-certificate fingerprints, review findings and unresolved security questions. These are technical disclosure, not passwords. This review does not conceal limitations or convert historical evidence into a security acceptance claim. |

The inherited source-manifest privacy labels are historical, scoped statements. Of 138 entries, 48 say restricted source review, seven local/unpublished clearance unestablished and 14 local/unpublished execution provenance. These counts are not 69 included secret files: many entries describe excluded originals or upstream licence notices. The owner's new attestation supplements the frozen records; it does not rewrite them.

## Licensing and attribution

| Material | Review outcome |
| --- | --- |
| Root application licence | Preserve the existing AGPL-3.0 text and existing attribution. The [retained licensing policy](../../public-snapshots/2026-10-26-pre-architecture-integration-a0402d90505d/files/docs/02-governance/licensing-policy.md) explicitly says it does not relicense supplied prose, private manuscripts or user content. Do not infer that the root licence settles every supplied asset's reuse terms. |
| Owner prose/design, template pack and logo | Redistribution rights confirmed by the owner. No new licence selected. Before publication, give an explicit scope statement identifying whether existing terms apply or whether these categories retain their existing rights with redistribution permission only. The completed review does not require inventing a blanket licence. |
| Third-party dependency inventories | The snapshot contains inventories/notices and references, not bundled Rust/npm libraries, browser binaries, fonts or the Mermaid renderer bundle. Frontend/runtime binary distribution obligations remain governed by the existing legal inventories; this documentation review does not certify a future binary release or SBOM. Retain existing notices and author attributions without rewriting upstream licence texts. |
| Generated diagrams | Mermaid 11.12.2 generated the SVGs. The viewer has inline project JavaScript and embedded SVGs; no Mermaid runtime bundle is included. Tool use alone is not a basis to declare all output MIT or AGPL. Some generated styles may reproduce renderer material; conservatively accompany a derivative with the exact Mermaid MIT notice in [MERMAID-LICENSE.txt](MERMAID-LICENSE.txt), without assigning that licence to the owner's diagram content. |
| External studies and links | Retain attribution and distinguish provenance metadata from copied source text. No imported claim/coverage passage from restricted study sources 0082–0087 was found. Their bodies and dependency source packages remain outside the snapshot. The owner attestation covers the three asked categories, not every third-party work mentioned in a register. |

The exact [Mermaid 11.12.2 upstream licence](https://raw.githubusercontent.com/mermaid-js/mermaid/mermaid@11.12.2/LICENSE) requires retaining its copyright and permission notice with copies or substantial portions of its software. The proposed companion notice is precautionary for any reproduced renderer material; it is not a conclusion that the entire generated output is third-party software.

## Concrete derivative preparation plan

1. Keep the historical snapshot, manifest, checksums and readiness controls unchanged. Do not publish ignored `.oldspecs`, private inputs, local build instructions, workspace data, credentials or personal settings.
2. If a public derivative is approved, copy it to a distinct directory and identify its historical source. Apply the nine JSON-field redactions recorded in `proposed_derivative_redactions` in [scan-results.json](scan-results.json). Replace only the browser executable/home prefix and renderer-cache prefix with stable placeholders; preserve error messages and stack suffixes. This addresses all 52 detected occurrences in three files.
3. Keep the original manifest explicitly labelled as the historical-source manifest. Generate a separate derivative manifest, checksums and change log; do not pretend altered files match the historical hashes. Check rendered navigation against the derivative's own paths.
4. Include existing licence/attribution material and the Mermaid companion notice. Obtain an explicit publication/licence-scope statement for the supplied categories if the public package is meant to grant reuse beyond the confirmed redistribution rights. No licence text or release approval is inferred here.
5. Re-run the bounded scan on the final proposed distribution and inspect changed images/metadata if any. Obtain approval of that concrete distribution before publishing. This task creates the review and plan only; no derivative or release has been created.

## Executed evidence

- [scan.py](scan.py) scanned all 315 text payloads and nine text controls, checked the 12 PNG chunk streams, and verified all 327 payload hashes and eight recorded control hashes. [scan-results.json](scan-results.json) records candidate locations and redaction pointers without candidate values.
- `control-checksums.json` is the ninth control; its own hash was compared separately with the pre-integration task baseline. All nine controls remain unchanged.
- No external `src`/`href`/`xlink:href` resource attributes were found in 51 SVGs and the HTML viewer. This is a static attribute check, not a new browser execution/network capture; the prior offline viewer evidence remains separately scoped.
- Visual review covered both previews, logo, five contact sheets, detailed diagrams 010/015/025 and viewer-desktop. No raster editing or recompression occurred.
- The immutable archive was verified again after writing this supplementary review. No original licence, application file, archive payload or archive control was edited. Application implementation remains stopped; publication remains **NOT_YET_APPROVED**.
