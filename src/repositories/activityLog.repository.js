const prisma = require('../config/prisma');

const activityLogRepository = {
    async findAll({ taskId, userId, action, limit = 10, offset = 0 } = {}) {
        const where = {};
        if (taskId) where.taskId = Number(taskId);
        if (userId) where.userId = Number(userId);
        if (action) where.action = action.toUpperCase();

        const [data, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip: Number(offset),
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
            }),
            prisma.activityLog.count({ where }),
        ]);

        return { data, total };
    },

    async findById(id) {
        return prisma.activityLog.findUnique({
            where: { id: Number(id) },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    },

    async create(data) {
        try {
            return prisma.activityLog.create({
                data: {
                    taskId: Number(data.taskId),
                    userId: Number(data.userId),
                    action: data.action.toUpperCase(),
                    changes: data.changes,
                    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
                },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
            });
        } catch (err) {
            if (err.code === 'P2003') {
                const error = new Error('taskId atau userId tidak ditemukan.');
                error.code = 'FOREIGN_KEY_CONSTRAINT';
                error.statusCode = 400;
                throw error;
            }
            throw err;
        }
    },

    async update(id, data) {
        try {
            return prisma.activityLog.update({
                where: { id: Number(id) },
                data: {
                    taskId: data.taskId !== undefined ? Number(data.taskId) : undefined,
                    userId: data.userId !== undefined ? Number(data.userId) : undefined,
                    action: data.action ? data.action.toUpperCase() : undefined,
                    changes: data.changes,
                    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
                },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
            });
        } catch (err) {
            if (err.code === 'P2025') return null;
            if (err.code === 'P2003') {
                const error = new Error('taskId atau userId tidak ditemukan.');
                error.code = 'FOREIGN_KEY_CONSTRAINT';
                error.statusCode = 400;
                throw error;
            }
            throw err;
        }
    },

    async remove(id) {
        try {
            await prisma.activityLog.delete({ where: { id: Number(id) } });
            return true;
        } catch (err) {
            if (err.code === 'P2025') return false;
            throw err;
        }
    },

    async findByTaskId(taskId, { limit = 50, offset = 0 } = {}) {
        const where = { taskId: Number(taskId) };
        const [data, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip: Number(offset),
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
            }),
            prisma.activityLog.count({ where }),
        ]);

        return { data, total };
    },
};

module.exports = activityLogRepository;
