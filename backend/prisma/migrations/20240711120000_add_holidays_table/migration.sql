CREATE TABLE "Holiday" (
    "id" SERIAL PRIMARY KEY,
    "identifier" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "infoUrl" TEXT,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "original" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
