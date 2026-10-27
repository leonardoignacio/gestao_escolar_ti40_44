const { PrismaClient } = require('@prisma/client');

/**
 * Instância Singleton do Prisma Client preparada para Prisma v7+.
 * A injeção da string de conexão (datasourceUrl) no construtor
 * promove baixo acoplamento e facilita o deploy em ambientes Cloud/Serverless.
 */
const prisma = global.prisma || new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

module.exports = prisma;