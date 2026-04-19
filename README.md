<div align="center">

<img src="https://img.shields.io/badge/Pakistan-Edtech-009900?style=for-the-badge" />
<img src="https://img.shields.io/badge/Micathon_'26-Money_Moves-0078D4?style=for-the-badge&logo=microsoft" />
<img src="https://img.shields.io/badge/Status-MVP-orange?style=for-the-badge" />

# 💰 PaisaKid

### *A cashless, cardless, and phone-less digital canteen wallet — built for kids who can't hold a phone yet.*

**Built for Micathon '26 · Microsoft Club GIKI · Theme: Money Moves**

</div>

---

## The Problem Nobody Talks About

Every school morning in Pakistan, millions of parents hand their kids a crumpled fifty-rupee note — and then spend the rest of the day wondering: *Did they eat? What did they buy? Did someone take it?*

For children in Montessori and Prep levels, cash is the only option. They're too young for smartphones, too young for banking apps, and too young to remember a PIN. The result is a system built entirely on trust and luck:

- Cash gets **lost** in tiny pockets
- Cash gets **stolen** by older kids
- Parents have **zero visibility** into what their child ate today
- Vendors deal with **incorrect change**, queues, and accounting headaches
- Schools have **no audit trail** for canteen activity

PaisaKid closes this gap entirely — replacing loose change with a closed-loop digital wallet that requires nothing more than a child's own face to spend from.

---

## How It Works

PaisaKid is a three-sided platform connecting **students**, **parents**, and **canteen merchants** under centralized school administration.

### 👶 For the Student — Photo-Tap Authentication

A child as young as three years old can use PaisaKid. At the point of sale, the merchant pulls up a 2×2 grid of four randomized student photos. The child simply **taps their own face**.

No PIN. No card. No phone. No memorization.

This is both an authentication mechanism *and* a physical proof of presence — the child must be standing there. It is instinctive, fast, and fraud-resistant in the one way that matters most at a school canteen: it cannot be impersonated remotely.

### 🏪 For the Merchant — Streamlined Point of Sale

The vendor interface is intentionally minimal. The merchant enters a Student ID (or scans a wristband/badge in future iterations), the photo grid appears, the child taps, and the transaction completes. The POS screen shows:

- Confirmed student name and photo
- Current wallet balance
- Transaction total and remaining balance
- A one-tap receipt generation

No cash. No change. No arguments about whether a note was real.

### 👪 For the Parent — Real-Time Visibility Dashboard

The moment a transaction completes, the parent knows. The parent dashboard provides:

- **Live balance** with a top-up flow via JazzCash / EasyPaisa simulation
- **Daily spending limit** controls — set a cap so a child cannot overspend in one sitting
- **Itemized receipts** for every purchase: item name, price, timestamp, merchant name
- **Push/in-app notifications** triggered at the moment of transaction
- **Pre-approval of items** *(see Scalability section)* — parents can decide in advance what their child is allowed to buy, and the child simply picks it up

### 🏫 For the School Admin — Centralized Control

A superuser administration panel sits above all other roles:

- Onboard and manage **student accounts** (linked to parent accounts)
- Onboard and manage **merchant accounts** (canteen stalls, tuck shops)
- View **platform-wide transaction logs** with export capability
- Set school-level policies (e.g., maximum single-transaction limits)
- Monitor **wallet top-up activity** across the school
- Handle **dispute resolution** with a complete immutable audit trail

---

## Technical Architecture

PaisaKid is designed around three non-negotiable principles: **atomicity**, **role separation**, and **closed-loop integrity**.

### Backend — Django (Python)

The core of PaisaKid is a **Closed-Loop Ledger** — all value lives within the system. Money flows in (via top-up) and is spent within the platform. There is no cash out except through the admin layer.

Every transaction is handled atomically using Django's database transaction system:

```
Debit student wallet  ──┐
                         ├── Single atomic operation. Either both succeed or neither does.
Credit merchant wallet ──┘
```

This eliminates the possibility of a student being charged without the merchant receiving credit, or vice versa. Double-spend is structurally impossible.

**Role-Based Access Control (RBAC)** enforces strict separation:

| Role | Scope |
|---|---|
| `ADMIN` | Full platform access, all accounts, all logs |
| `PARENT` | Own child's wallet, top-up, limits, receipts |
| `MERCHANT` | POS interface only, own transaction history |
| `STUDENT` | Read-only balance (via parent portal) |

### Frontend — React

A responsive React frontend serves three distinct dashboards, each purpose-built for its user:

- **Parent Portal** — clean, mobile-first, notification-driven
- **Merchant POS** — tablet-optimized, large tap targets, minimal friction
- **Admin Panel** — data-dense, table-driven, export-ready

### Real-Time Updates

Parent notifications are delivered via **optimized polling** to keep the implementation dependency-light for an MVP. The architecture is designed to swap polling for WebSockets (Django Channels) post-hackathon with no structural changes.

### Database

Relational database with the following core models:

```
School → Merchant
       → Student → Parent (1:1 or 1:many for siblings)
                 → Wallet → Transaction (immutable append-only log)
                 → AllowedItems (optional pre-approval list)
```

All `Transaction` records are **append-only** — no row is ever updated or deleted after creation. This is the audit trail.

---

## Feature Matrix

| Feature | Status |
|---|---|
| Student photo-tap authentication | ✅ Core MVP |
| Merchant POS interface | ✅ Core MVP |
| Parent real-time notification | ✅ Core MVP |
| Parent dashboard (balance, limits, receipts) | ✅ Core MVP |
| Admin dashboard (accounts, logs, policies) | ✅ Core MVP |
| Sign up / Sign in (all roles) | ✅ Core MVP |
| Closed-loop ledger with atomic transactions | ✅ Core MVP |
| JazzCash / EasyPaisa top-up simulation | ✅ Core MVP |
| Daily spending limits per student | ✅ Core MVP |
| Pre-approved item lists (parent-set) | 🔵 Scalability Tier |
| Student order pre-placement (pick-up model) | 🔵 Scalability Tier |
| NFC wristband / QR badge auth | 🔵 Scalability Tier |
| WebSocket real-time push | 🔵 Scalability Tier |
| Multi-school / district deployment | 🔵 Scalability Tier |

---

## Scalability: Where This Goes Next

The MVP deliberately solves one problem completely. The architecture, however, is designed to grow.

**Pre-Approved Item Lists.** Parents log in the night before and mark which items their child is allowed to purchase tomorrow. At the POS, if a child tries to buy something outside this list, the transaction is declined. The child's nutrition is no longer just *visible* — it's *controlled*.

**Pre-Order / Pick-Up Model.** Parents place canteen orders in the morning from their phone. The merchant sees a queue of pre-paid orders. The student walks up and picks up their tray — no transaction at the counter at all. Rush hour becomes a logistics problem, not a payment problem.

**NFC Wristbands.** Replace the photo-grid tap with a passive NFC wristband. The child taps the wristband on the reader, photo confirmation appears, done. No hardware changes to the rest of the system.

**Multi-School Deployment.** The school is already a first-class entity in the data model. Adding a second school is a configuration change, not an architectural one.

---

## Judging Criteria — Direct Alignment

**Relevance to Theme (Money Moves)**
PaisaKid moves money — small amounts, many times a day, for a population (young children) that has never had access to digital finance tools. It makes money *move better* for the next generation.

**Real-World Impact**
Cash handling in school canteens is a daily, universal friction point for Pakistani families. This is not a solution looking for a problem.

**Technical Execution**
The MVP strategy is 100% of one core flow — not 20% of ten. Every feature in the Core MVP column above is fully functional and demo-able. The architecture is sound enough that every Scalability Tier feature is an extension, not a rewrite.

**Innovation**
Photo-tap authentication for children who cannot read or remember PINs is novel in the Pakistani edtech context. The pre-approval / pick-up model reframes canteen management from *payment processing* to *nutritional control*.

---

## Team

Built at **Micathon '26** by Microsoft Club GIKI.

---

<div align="center">
<sub>PaisaKid — because every paisa should have a paper trail.</sub>
</div>
