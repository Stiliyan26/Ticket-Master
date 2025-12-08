# Project Progress: TicketMaster Lite

> 📍 **Detailed roadmap**: See `.cursor/rules/PROGRESS.mdc`
> 📚 **NestJS reference**: See `.cursor/rules/nestjs-course-notes.mdc`

---

## Current Phase: 1 - Foundation

**Objective**: Build a "Safe" schema that rejects bad data.

### ✅ Done
- Project setup (NX monorepo)
- DatabaseModule with TypeORM + PostgreSQL  
- ConfigModule with Zod validation

### 🔄 Next Up
- [ ] **Event entity** - fields, `@VersionColumn`, DB constraints
- [ ] **Booking entity** - fields, relation to Event
- [ ] **DTOs** - CreateEventDto, CreateBookingDto with validation decorators
- [ ] **BookingService** - transaction logic (decrement tickets atomically)
- [ ] E2E test: verify no overselling under concurrent requests

---

## Roadmap Overview

| Phase | Focus | Status |
|-------|-------|--------|
| 1. Foundation | Safe schema, DTOs, TypeORM | 🔄 In Progress |
| 2. Distributed Locking | Redis + Redlock | ⏳ Pending |
| 3. Resilience | Circuit breaker, idempotency | ⏳ Pending |
| 4. Async Consistency | BullMQ, Outbox, Sagas | ⏳ Pending |
| 5. API Polish | Swagger, rate limiting | ⏳ Pending |
| 6. Angular Frontend | UI for booking flow | ⏳ Later |
