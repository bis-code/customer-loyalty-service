# Customer Loyalty Service

---

### Overview
A microservice designed to manage and track customer loyalty points through various events.

---

### Built With
- ![Typescript Badge](https://img.shields.io/badge/-Typescript-05122A?style=flat&logo=typescript)
- ![Node.js Badge](https://img.shields.io/badge/-Node.js-05122A?style=flat&logo=nodedotjs)
- ![Express Badge](https://img.shields.io/badge/-Express-05122A?style=flat&logo=express)
- ![Prisma Badge](https://img.shields.io/badge/-Prisma-05122A?style=flat&logo=prisma)
- ![SQLite Badge](https://img.shields.io/badge/-SQLite-05122A?style=flat&logo=sqlite)

---

## Key Endpoints

### 1. Webhook (`/webhook`)
Handles events like:
- **CustomerCreated**
- **CustomerDeleted**
- **OrderPlaced**
- **OrderCancelled**
- **OrderReturned**

**Loyalty Points:** Earn 1 point for every 50 kroner spent via **OrderPlaced** events. Points persist unless an **OrderCancelled** or **OrderReturned** event occurs.

### 2. Check Points (`/customer/{customerId}/points`)
Retrieve a customer's current loyalty points total.

### 3. Consume Points (`/customer/{customerId}/consume`)
Deduct a specified number of loyalty points, returning the updated balance.

---

## Processing Logic

Events are queued through the `/webhook` endpoint and processed sequentially every 5 seconds, based on the event timestamp and order.

---

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
2. **Setup database**
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate client
    npx prisma generate
3. **Run the service**
    ```bash
   npm run dev
4. **Run tests**
   ```bash
   npm run test