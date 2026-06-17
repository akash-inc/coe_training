# Day 15: Next Steps and Completion Checklist

Prioritized backlog from capstone audits. **No code changes unless you approve items explicitly.**

---

## Day 15 Completion Checklist

Tick off during your retro:

### Reviews completed

- [ ] Read [CODE_REVIEW.md](./CODE_REVIEW.md) with team
- [ ] Read [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- [ ] Read [A11Y_AUDIT.md](./A11Y_AUDIT.md)
- [ ] Run or review [PERFORMANCE.md](./PERFORMANCE.md) k6 script
- [ ] Skim [DOC_REVIEW.md](./DOC_REVIEW.md) and updated README

### Deliverables created

- [ ] [ARCHITECTURE.md](./ARCHITECTURE.md) shared with team
- [ ] [RUNBOOK.md](./RUNBOOK.md) accessible to ops/on-call
- [ ] [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) used in presentation
- [ ] [TRADE_OFFS.md](./TRADE_OFFS.md) discussed in retro
- [ ] [KNOWLEDGE_TRANSFER.md](./KNOWLEDGE_TRANSFER.md) linked from team wiki
- [ ] [REFLECTION_TEMPLATE.md](./REFLECTION_TEMPLATE.md) filled in personally

### Human-only activities

- [ ] Live demo presented
- [ ] Technical trade-offs discussion held
- [ ] Personal reflection completed
- [ ] Celebration / next steps planning with team

---

## Prioritized Backlog

### Quick wins (approve to implement)

| ID | Item | Source | Effort |
|----|------|--------|--------|
| Q1 | Add labels to task create/edit inputs | A11Y P1, U3 | Small |
| Q2 | `role="alert"` on login error | A11Y U1 | Tiny |
| Q3 | `role="status"` on loading states | A11Y R2 | Tiny |
| Q4 | `aria-live="polite"` on task/comment errors | A11Y U2 | Small |
| Q5 | Update README test count and observability list | DOC_REVIEW | Done in README update |
| Q6 | `aria-controls` + panel `id` on comment expand | A11Y R1 | Small |
| Q7 | Remove duplicate Comments button | CODE_REVIEW M1 | Small |

### Medium priority

| ID | Item | Source | Effort |
|----|------|--------|--------|
| M1 | Add Vitest + jest-axe for LoginForm, TaskList | CODE_REVIEW H2 | Medium |
| M2 | Rate limiting on `/token` | SECURITY ID-2 | Medium |
| M3 | Persist refresh tokens in PostgreSQL | SECURITY ID-1 | Medium |
| M4 | gitleaks in CI | SECURITY checklist | Small |
| M5 | Log WebSocket broadcast failures | CODE_REVIEW M5 | Small |
| M6 | Skip-to-main-content link | A11Y O2 | Tiny |
| M7 | Focus management on comments panel open | A11Y O3 | Small |
| M8 | Run k6 in CI (optional non-blocking job) | PERFORMANCE | Medium |
| M9 | Lighthouse a11y CI on frontend build | A11Y | Medium |

### Long-term

| ID | Item | Source | Effort |
|----|------|--------|--------|
| L1 | Central secrets manager (Vault, Doppler, etc.) | SECURITY | Large |
| L2 | Multi-user RBAC + OAuth | SECURITY AC-1 | Large |
| L3 | Blue/green deploy | Ops | Large |
| L4 | Redis pub/sub for WebSocket multi-instance | TRADE_OFFS | Large |
| L5 | Async SQLAlchemy if load requires | TRADE_OFFS | Large |
| L6 | Frontend code splitting (565 kB bundle) | CODE_REVIEW M6 | Medium |

---

## Suggested Sprint Plan (if continuing)

**Sprint 1 (polish):** Q1-Q7, M5, M6  
**Sprint 2 (quality):** M1, M4, M8  
**Sprint 3 (security):** M2, M3  
**Sprint 4+ (production):** L1-L3 as needed

---

## Celebrate

You shipped a full-stack app with:

- Real-time WebSocket comments
- 49 automated backend tests
- Structured observability
- Containerized local dev
- CI pipeline
- Cloud deployment runbook

**Next steps to consider:**

- Present demo recording to your team
- Open PRs for approved quick wins
- Share [KNOWLEDGE_TRANSFER.md](./KNOWLEDGE_TRANSFER.md) with new maintainers

---

## Approval Log

Track fixes you approve from audit-only scope:

| Date | Item ID | Approved by | PR/link |
|------|---------|-------------|---------|
| | | | |

---

## Related Documents

- [CODE_REVIEW.md](./CODE_REVIEW.md)
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- [A11Y_AUDIT.md](./A11Y_AUDIT.md)
- [KNOWLEDGE_TRANSFER.md](./KNOWLEDGE_TRANSFER.md)
