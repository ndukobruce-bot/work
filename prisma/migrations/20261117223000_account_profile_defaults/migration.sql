PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'WORKER',
    "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "country" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT NOT NULL DEFAULT 'https://api.dicebear.com/9.x/initials/svg?seed=Robinson%20McCubbins',
    "level" TEXT NOT NULL DEFAULT 'Beginner',
    "rating" REAL NOT NULL DEFAULT 0,
    "approvalRate" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("accountStatus", "approvalRate", "avatarUrl", "country", "createdAt", "email", "id", "level", "name", "passwordHash", "rating", "role", "verified") SELECT "accountStatus", "approvalRate", "avatarUrl", "country", "createdAt", "email", "id", "level", "name", "passwordHash", "rating", "role", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
