-- CreateEnum
CREATE TYPE "ReservationAction" AS ENUM ('RESERVE', 'CANCEL');

-- CreateTable
CREATE TABLE "ReservationActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "concertId" TEXT NOT NULL,
    "action" "ReservationAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationActivity_concertId_idx" ON "ReservationActivity"("concertId");

-- CreateIndex
CREATE INDEX "ReservationActivity_userId_idx" ON "ReservationActivity"("userId");

-- AddForeignKey
ALTER TABLE "ReservationActivity" ADD CONSTRAINT "ReservationActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationActivity" ADD CONSTRAINT "ReservationActivity_concertId_fkey" FOREIGN KEY ("concertId") REFERENCES "Concert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
