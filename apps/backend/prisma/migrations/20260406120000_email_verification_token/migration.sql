ALTER TABLE "users" ADD COLUMN "emailVerificationToken" TEXT;

CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "users"("emailVerificationToken");
