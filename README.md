# Concert Ticket Booking

ระบบจองตั๋วคอนเสิร์ต (ฟรี) — Next.js + NestJS + PostgreSQL + Docker
รองรับ 2 บทบาท: **ADMIN** (สร้าง/ลบคอนเสิร์ต, ดูประวัติทั้งหมด) และ **USER** (จอง/ยกเลิก 1 ที่นั่งต่อคอนเสิร์ต, ดูประวัติตัวเอง)

---

## 0. Live Demo

เข้าไปลองเล่นได้เลย (ไม่ต้องติดตั้งอะไร): **https://concert.deployeffect.com**
- ลอง Admin ได้ด้วยบัญชี: **admin@concert.com / admin1234**
- หรือสมัคร User ใหม่เองผ่านหน้า Register

---

## 1. Installation

รันทั้งระบบด้วย Docker คำสั่งเดียว (db + backend + frontend)

### macOS
1. ติดตั้ง **Homebrew** ก่อน (ถ้ายังไม่มี — เครื่อง Mac ส่วนใหญ่จะมีอยู่แล้ว) เช็คด้วย `brew -v` ถ้าไม่มีให้รัน:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. ติดตั้ง Docker Desktop ผ่าน Homebrew แล้วเปิดโปรแกรม:
   ```bash
   brew install --cask docker
   open -a Docker
   ```
3. Clone โปรเจกต์ + เข้า folder:
   ```bash
   git clone https://github.com/mosdevsw/concert.git
   cd concert
   ```
4. รัน Docker:
   ```bash
   docker compose up --build -d
   ```

### Windows
1. ติดตั้ง **Docker Desktop** ลงเครื่อง (ดาวน์โหลดจาก docker.com) แล้วเปิดโปรแกรมให้รันอยู่
2. เปิด **Command Prompt (cmd)** แล้ว clone + เข้าไปที่ folder โปรเจกต์:
   ```cmd
   git clone https://github.com/mosdevsw/concert.git
   cd concert
   ```
3. สั่งรัน:
   ```cmd
   docker compose up --build -d
   ```

### เปิดใช้งาน
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- บัญชี Admin (seed ให้อัตโนมัติ): **admin@concert.com / admin1234**

> หมายเหตุ: โปรเจกต์นี้ commit ไฟล์ `.env` ขึ้น git ด้วยเพื่อความสะดวกในการตรวจ assignment (ปกติไม่ควรทำใน production)

---

## 2. Usage (การใช้งานเว็บ)

**หน้าแรก — Select Access Level:** เลือกเข้าเป็น **User** (Enter Workspace) หรือ **Administrator** (Enter Portal)

### User
1. Register บัญชีใหม่ หรือ Login (บัญชีที่สมัครเองจะเป็น role USER)
2. เห็นรายการคอนเสิร์ตทั้งหมด (รวมที่เต็มแล้ว)
3. กด **Reserve** เพื่อจอง — จองได้ 1 ที่นั่ง/คน/คอนเสิร์ต · คอนเสิร์ตที่เต็มจะขึ้น **Sold out**
4. กด **Cancel** เพื่อยกเลิกการจองของตัวเอง

### Admin
1. Login ด้วย **username = admin@concert.com / password = admin1234**
2. **Home** — การ์ดสถิติ (Total seats / Reserve / Cancel) + 2 แท็บ:
   - **Overview:** รายการคอนเสิร์ต + ปุ่ม Delete (มี popup ยืนยันก่อนลบ)
   - **Create:** ฟอร์มสร้างคอนเสิร์ต (ชื่อ, จำนวนที่นั่ง, รายละเอียด)
3. **History** — ประวัติการจอง/ยกเลิกของผู้ใช้ทุกคน (audit trail)

### หมายเหตุพฤติกรรม (สำคัญ)
- **แยก role เข้มงวด:** Admin **จองตั๋วไม่ได้** (การจองเป็นสิทธิ์ของ USER เท่านั้นตาม spec)
- **ปุ่ม Switch to Admin/User:** ต้อง login ใหม่เสมอ (ไม่สลับ view ตรงๆ) — ถ้า USER พยายามเข้า Admin จะถูกปฏิเสธ

---

## 3. Project Structure

Monorepo แบ่งเป็น 3 ส่วน

### Frontend (`/frontend`) — Next.js 16 (App Router) + TypeScript
- **State:** Zustand (auth, concert, admin, toast) — เก็บ JWT ใน localStorage
- **Styling:** Tailwind CSS + CSS Modules (แยกไฟล์ต่อเพจ/component) + design tokens ใน `globals.css`, ฟอนต์ Roboto
- **หน้าจอ:** Landing (เลือก role) → Login/Register (split-screen) → User dashboard (การ์ดคอนเสิร์ต จอง/ยกเลิก) → Admin dashboard (สถิติ, สร้าง/ลบ, ประวัติ)
- **ฟีเจอร์:** route guard ตาม role, สลับ portal (re-login), toast, error handling, password show/hide
- **Tests:** Jest + React Testing Library (stores, lib, components) coverage > 80%

### Backend (`/backend`) — NestJS + Prisma 7
- **Auth:** JWT (payload มี role) + argon2 hash password, Passport strategy
- **Authorization:** NestJS Guards + `@Roles` decorator กัน USER เข้า endpoint ของ ADMIN
- **Modules:** `auth`, `concerts`, `reservations`, `prisma` — แยก Controller / Service / DTO ชัดเจน
- **Validation:** class-validator ผ่าน DTO (seat 1–500, name ≤30, description ≤1500)
- **Logic เด่น:** จองได้ 1 ที่นั่ง/คน/คอนเสิร์ต (`@@unique`), กัน over-booking, ลบคอนเสิร์ตแบบ **soft-delete** (เก็บ audit ไว้), บันทึกทุก action ลง **append-only activity log**
- **Tests:** Jest 42 tests, coverage > 80% (services/controllers/guards)

### Database — PostgreSQL 16 (Docker) + Prisma Migrations
- ตาราง: `User`, `Concert`, `Reservation` (สถานะปัจจุบัน), `ReservationActivity` (log ประวัติ)
- Migrations เก็บใน `backend/prisma/migrations` — container รัน `prisma migrate deploy` ให้อัตโนมัติตอน start
- Admin ถูก seed อัตโนมัติตอน backend boot

---

## 4. Bonus (Theory)

### 4.1 Performance Optimization — ถ้าข้อมูลเยอะขึ้นและ traffic สูง
- **Database Indexing** — สร้าง index บนคอลัมน์ที่ query บ่อย (foreign key `concertId`/`userId`, `status`) เพื่อให้ count/join เร็วขึ้น (โปรเจกต์นี้ทำ `@@index` ไว้แล้วบน activity log)
- **Caching** — ใช้ Redis เก็บผลลัพธ์ที่อ่านบ่อยแต่เปลี่ยนน้อย เช่น รายการคอนเสิร์ต/สถิติ (ลดภาระ DB) + ใส่ HTTP cache header
- **Pagination** — ไม่ดึงทั้งหมดทีเดียว ใช้ limit/offset หรือ cursor-based เมื่อรายการยาว
- **Query optimization** — เลี่ยง N+1, ใช้ `select`/`aggregate`/`_count` แทนการโหลดทุก record มานับเอง (โปรเจกต์นี้ใช้ `_count` + `aggregate`)
- **CDN + Static optimization** — ลดงาน render สดฝั่ง server ทำให้หน้าเว็บเบาและโหลดเร็ว
  - **CDN** — วางไฟล์ที่ไม่เปลี่ยน (รูป/CSS/JS/ฟอนต์) บนเซิร์ฟเวอร์ที่กระจายอยู่ทั่วโลก ผู้ใช้โหลดจากจุดที่ใกล้ตัวที่สุด → เร็วขึ้น + ลดภาระ server หลัก
  - **SSG/ISR** — ให้ Next.js สร้างหน้า HTML ไว้ล่วงหน้า (ตอน build หรือ regenerate เป็นระยะ) แทนการ render ใหม่ทุก request → ส่งไฟล์สำเร็จรูปได้เลย
  - **Image optimization** — `<Image>` ของ Next.js ย่อขนาดรูป แปลงเป็นฟอร์แมตเบา (WebP) และ lazy load ให้อัตโนมัติ
  - **Code splitting** — แบ่ง JavaScript เป็นชิ้นเล็กๆ โหลดเฉพาะหน้าที่ผู้ใช้เปิด ไม่ต้องส่ง JS ทั้งเว็บมาก้อนเดียว
- **Connection pooling** — เปิด connection ค้างไว้จำนวนหนึ่งแล้วหมุนเวียนใช้ซ้ำ แทนการเปิดใหม่ทุก request (เพราะ PostgreSQL รับ connection พร้อมกันได้จำกัด ~100)
  - *ตัวอย่าง:* มี 1,000 request พร้อมกัน แต่ตั้ง pool ไว้ 20 → เปิด connection จริงแค่ 20 ช่อง หมุนเวียนใช้ทีละคิว (ไม่ใช่เปิด 1,000 ช่องจน DB ล่ม) ตัวที่ 21 เป็นต้นไปก็รอคิวทำต่อ
  - งานนี้ Prisma มี pool ในตัวอยู่แล้ว; ถ้า scale หลาย instance ค่อยเสริม **PgBouncer** เป็นตัวจัดการ pool ตรงกลางก่อนถึง DB
- **Horizontal scaling / Load balancer** — เพิ่ม instance ของ backend แล้วกระจาย load เมื่อ traffic สูง

### 4.2 Concurrency Control — กัน over-booking เมื่อ 1,000 คนแย่งจองที่นั่งสุดท้ายพร้อมกัน
- **Database Transaction** — ห่อขั้นตอน "เช็คที่ว่าง → สร้าง reservation" ไว้ใน transaction เดียว (โปรเจกต์นี้ใช้ Prisma `$transaction`)
- **Atomic conditional update** — update แบบมีเงื่อนไข เช่น `UPDATE ... WHERE availableSeats > 0` ในคำสั่งเดียว ให้ DB ตัดสินแบบ atomic
- **Unique Constraint** — `@@unique([userId, concertId])` กันคนเดิมจองซ้ำในระดับ DB (แม้ยิงพร้อมกัน)
- **Pessimistic Locking** — ใช้คำสั่ง FOR UPDATE เช่น `SELECT * FROM "Concert" WHERE id = 'x' FOR UPDATE` ล็อกแถวคอนเสิร์ต/จำนวนที่นั่งระหว่างจอง ให้คำขอเรียงกันทีละคน (ปลอดภัยสุดสำหรับที่นั่งจำกัดแต่จะทำให้ช้าหน่อย)
- **Message Queue** — ส่งคำขอจองเข้า queue แล้วประมวลผลทีละรายการ (serialize) เมื่อ traffic สูงมาก โดยส่วนใหญ่ ใช้ Kafka ในการรับ message queue แล้วทำ

---

> **หมายเหตุ:** ผมใช้ AI (Claude) ช่วยในการเขียนโค้ด เนื่องจากไม่ค่อยถนัดงานฝั่ง Next.js และ NestJS โดยตรง แต่ concept ต่าง ๆ (การออกแบบระบบ, โครงสร้าง, database, business logic และการแก้ปัญหาต่าง ๆ) ผมเป็นคนวิเคราะห์และออกแบบเองทั้งหมด โดยให้ AI ช่วยเหลือด้านการ implement เท่านั้น


