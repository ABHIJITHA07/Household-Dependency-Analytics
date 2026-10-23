# 04 — Non-Functional Requirements

| ID | Category | Requirement | Measure |
|---|---|---|---|
| NFR-1 | Performance | Analytics, CRUD responses | p95 < 500 ms locally |
| NFR-2 | Performance | ML prediction round trip | < 2 s (timeout 8 s) |
| NFR-3 | Performance | Gemini generation | Timeout 20 s; UI shows progress |
| NFR-4 | Performance | PDF generation | < 5 s for typical report |
| NFR-5 | Usability | New user reaches first analytics result | ≤ 5 minutes, no manual |
| NFR-6 | Usability | Plain-language wording, no jargon without tooltip | Review checklist |
| NFR-7 | Accessibility | WCAG 2.1 AA contrast for text; keyboard operable; labelled inputs; focus visible; charts have text alternatives (data tables or summaries) | Manual + axe check |
| NFR-8 | Responsiveness | Works from 360 px to 1920 px wide | Test at 360/768/1024/1440 |
| NFR-9 | Security | OWASP basics from `20` | Checklist |
| NFR-10 | Reliability | Core analytics unaffected by ML/Gemini outage | Test TC-GEM-01, TC-ML-02 |
| NFR-11 | Data integrity | Foreign keys, CHECK constraints, transactions on multi-row writes | DB tests |
| NFR-12 | Maintainability | Layered architecture, no logic in routes, files < ~300 lines where practical | Review |
| NFR-13 | Testability | Analytics engine is pure functions; Gemini and ML mockable | Unit tests |
| NFR-14 | Portability | Runs locally with Node 20, Python 3.11, MySQL 8; deploys to Vercel/Render/Railway + managed MySQL | `26` |
| NFR-15 | Observability | Structured server logs with request id; no secrets or PII in logs | Review |
| NFR-16 | Compatibility | Latest 2 versions of Chrome, Edge, Firefox, Safari | Smoke test |
| NFR-17 | Documentation | README + setup guide let a new developer run the app in < 30 minutes | Dry run |
| NFR-18 | Privacy | Gemini receives no name, email, location or free text | Unit test on payload builder |
| NFR-19 | Cost control | Gemini calls rate limited and cached | `13` |
| NFR-20 | Localization | English UI, ₹ currency, `en-IN` number format | Review |
