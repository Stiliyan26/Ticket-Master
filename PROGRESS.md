# Project Progress: TicketMaster Lite

## Roadmap

### Phase 0: Setup
- [x] Create .cursorrules
- [x] Create PROGRESS.md

### Phase 1: Foundation & NestJS Patterns
- [ ] **Discussion**: Persistence Layer (Hybrid: Postgres + Redis)
- [ ] **Coding**: Setup DatabaseModule (Dynamic) + Config
- [ ] **Discussion**: Dependency Injection for Redis
- [ ] **Coding**: Redis Custom Provider
- [ ] **Discussion**: Data Modeling & Constraints
- [ ] **Coding**: Entities (Ticket, Event, Booking) + Validation Pipes
- [ ] **Discussion**: Concurrency & Locking
- [ ] **Coding**: DistributedLock Decorator + Optimistic Locking

### Phase 2: Resilience
- [ ] **Discussion**: Error Handling Strategies
- [ ] **Coding**: Global Exception Filter
- [ ] **Discussion**: External Failures (Circuit Breaker)
- [ ] **Coding**: ResilienceModule
- [ ] **Discussion**: Observability
- [ ] **Coding**: Logging Interceptor

### Phase 3: Async Consistency
- [ ] **Discussion**: Async Architecture
- [ ] **Coding**: BullMQ Setup
- [ ] **Discussion**: Reliability (Outbox)
- [ ] **Coding**: Transactional Outbox
- [ ] **Discussion**: Sagas
- [ ] **Coding**: Saga Workflow

---

## Course Curriculum Checklist (Practice Tracker)

### REST API Fundamentals
- [ ] Controllers & Routing
- [ ] DTOs & Validation
- [ ] Services & DI
- [ ] Modules

### Persistence (TypeORM & Postgres)
- [ ] Docker Setup
- [ ] TypeORM Integration
- [ ] Entities & Relations
- [ ] Transactions

### Advanced Dependency Injection
- [ ] Custom Providers (Factory)
- [ ] Dynamic Modules
- [ ] Asynchronous Providers

### Configuration
- [ ] ConfigModule & Validation

### Building Blocks
- [ ] Exception Filters (Global)
- [ ] Guards (Auth)
- [ ] Interceptors (Logging/Locking)
- [ ] Pipes (Validation)
- [ ] Custom Decorators

### Testing
- [ ] Unit Tests
- [ ] E2E Tests

