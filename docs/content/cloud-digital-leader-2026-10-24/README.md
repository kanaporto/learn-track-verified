# Cloud Digital Leader: conceptual question-bank revision

Released content prepared on 24 October 2026 against commit `c142fb4fa36ba69726aeb1ec5bc60912ddde7ad2`.

The introductory bank previously mixed conceptual questions with implementation and advanced engineering questions. This revision limits the changed items to recognition, purpose, benefits, basic comparisons and straightforward service selection. It does not require commands, configuration procedures, exact IAM roles or detailed architecture design.

## Result

| Change | Questions |
| --- | ---: |
| Preserved without changes | 332 |
| Rewritten in Spanish and English, retaining IDs | 82 |
| Retired from the active bank | 56 |
| New original bilingual questions | 46 |
| Active bank | 460 |

The active bank remains `src/data/cloud-questions.json`. These archive files are documentation and are not imported into the application. `retired-questions.json` preserves the 56 retired items. `rewritten-originals.json` preserves the original versions of the 82 rewritten items. The Git history also preserves the complete previous bank. No user records or progress are modified by this content revision.

## Coverage added

| Region | Added | Focus | Active total |
| --- | ---: | --- | ---: |
| 1 | 4 | Integrated data/AI value; IP and DNS | 91 |
| 2 | 6 | Genesis, collection, storage and activation | 85 |
| 3 | 4 | Agentic AI; AI Hypercomputer and flexible consumption | 83 |
| 4 | 4 | Refactoring; API integration and business value | 69 |
| 5 | 16 | Certificates, VPC/firewalls/Shared VPC, malware, security posture, resilience, trust and compliance | 79 |
| 6 | 12 | DevOps/SRE, traffic/saturation, cloud center of excellence, CapEx/OpEx | 53 |

## References and limits

- [Google Cloud Digital Leader exam guide](https://services.google.com/fh/files/misc/cloud_digital_leader_exam_guide_english.pdf), English guide dated 12 August 2026 in the existing simulator configuration.
- User-provided course files `M1_CDL_Student_Slides_v3.pdf` through `M7_CDL_Student_Slides_v3.pdf`. Topic/page anchors and additional documentation links are recorded in `manifest.json`. M7 is a recap, not an additional exam domain.
- [Google sample form](https://docs.google.com/forms/d/e/1FAIpQLSedAmf77MGS7FGEaylFzY51KtBd7kkIZJIMDsV5zSRSmpKIOA/viewform), March 2024 version, used as a reference for conceptual depth and style. The new questions are original; sample questions are not copied into this revision.

This is an editorial scope review. It does not establish psychometric equivalence, guarantee the difficulty of an official exam, or imply Google approval. The 332 preserved items have not received a separate new technical fact check. Simulator status remains `partial`; the 70% practice threshold remains a Dumpi Learn guideline.

## Validation performed

- Exact counts, unique IDs, region/domain consistency, bilingual fields, four distinct options per language and valid answer keys.
- No exact duplicate question stems after normalization in either language. This does not exclude conceptual overlap, which is useful for practice.
- Deep equality of all 332 preserved items against the original bank; all 82 rewrite IDs retained; all 56 retired IDs excluded.
- 200 seeded draws using the actual `drawMockPlan` implementation: 50 unique questions each, 9/9/9/9/9/5 distribution, no shortfall, all 460 active questions reachable across draws, no retired questions drawn.
- Existing reward boundaries checked: 34/50 gives 0, 35/50 gives 500, 47/50 gives 500, 48/50 gives 650 points.
- The repository test expecting the bank size is updated to 460, with a Cloud-specific draw regression test. The complete Vitest suite and application build have not been run locally because the application dependencies are not installed in this workspace.
