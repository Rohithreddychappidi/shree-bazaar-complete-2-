const { PrismaClient } = require("@prisma/client");

// A single shared Prisma client instance for the whole app.
const prisma = new PrismaClient();

module.exports = prisma;
