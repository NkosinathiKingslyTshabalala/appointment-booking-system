# API Design

## Base URL

/api

---

## Authentication

POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile

POST /api/auth/logout

---

## Providers

GET /api/providers

GET /api/providers/:id

PUT /api/providers/:id

---

## Services

GET /api/services

GET /api/services/:id

POST /api/services

PUT /api/services/:id

DELETE /api/services/:id

---

## Availability

GET /api/availability

POST /api/availability

PUT /api/availability/:id

DELETE /api/availability/:id

---

## Appointments

GET /api/appointments

GET /api/appointments/:id

POST /api/appointments

PUT /api/appointments/:id

DELETE /api/appointments/:id

---

## Notifications

GET /api/notifications

PUT /api/notifications/:id/read