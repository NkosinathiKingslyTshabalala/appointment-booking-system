# Database Design

## Database

PostgreSQL

## Why PostgreSQL?

The Appointment Booking System uses PostgreSQL because the application contains multiple related entities such as users, providers, services, appointments, and availability.

A relational database provides data integrity, strong relationships using foreign keys, and efficient querying for appointment scheduling.

---

## Main Tables

- Users
- Provider Profiles
- Services
- Availability
- Appointments
- Notifications

---

## Relationships

- One User can have one Provider Profile.
- One Provider can offer many Services.
- One Provider can define many Availability records.
- One Client can create many Appointments.
- One Service can appear in many Appointments.
- One User can receive many Notifications.