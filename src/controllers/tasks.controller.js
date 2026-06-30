// File: src/controllers/tasks.controller.js
const taskRepo = require('../repositories/task.repository');

const listTasks = async (req, res, next) => {
    try {
        const { status, priority, sort, order, limit, offset } = req.query;

        // User biasa hanya lihat task miliknya; Admin lihat semua
        const userId = req.user.role === 'ADMIN' ? undefined : req.user.userId;

        const { data, total } = await taskRepo.findMany({
            userId, status, priority, sort, order, limit, offset
        });

        const numLimit = Number(limit) || 10;
        const numOffset = Number(offset) || 0;

        res.status(200).json({
            data,
            pagination: {
                total, limit: numLimit, offset: numOffset,
                hasNext: numOffset + numLimit < total,
                hasPrev: numOffset > 0,
                nextOffset: numOffset + numLimit < total ? numOffset + numLimit :
                    null,
                prevOffset: numOffset > 0 ? Math.max(0, numOffset - numLimit) :
                    null,
            },
        });
    } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
    try {
        const { title, description, status, priority, dueDate, categoryId } = req.body;
        // Gunakan userId dari token - jangan percaya userId dari body!
        const userId = req.user.userId;

        const task = await taskRepo.create({
            title, description, status, priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            userId,
            categoryId: categoryId || null,
        });

        // ── EMIT REAL-TIME EVENT ────────────────────────────
        const io = req.app.get('io');
        if (io) {
            // Kirim ke semua user yang terhubung (room global)
            io.to('tasks:global').emit('task:created', { task });
            // Kirim notifikasi personal ke pembuat task
            io.to(`user:${userId}`).emit('notification', {
                type: 'SUCCESS',
                title: 'Task Berhasil Dibuat',
                message: `Task "${task.title}" telah ditambahkan.`,
            });
        }

        res.status(201).set('Location', `/api/v1/tasks/${task.id}`).json({
            data: task
        });
    } catch (err) { next(err); }
};

const getTask = async (req, res, next) => {
    try {
        // req.task sudah di-set oleh checkTaskOwnership middleware (menghindari double query)
        const task = req.task || await taskRepo.findById(req.params.id);
        if (!task) return res.status(404).json({
            error: {
                code: 'NOT_FOUND',
                message: `Task ID ${req.params.id} tidak ditemukan.`
            }
        });
        res.status(200).json({ data: task });
    } catch (err) { next(err); }
};

const replaceTask = async (req, res, next) => {
    try {
        const task = await taskRepo.update(req.params.id, req.body);
        if (!task) return res.status(404).json({
            error: {
                code: 'NOT_FOUND',
                message: `Task ID ${req.params.id} tidak ditemukan.`
            }
        });
        res.status(200).json({ data: task });
    } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, dueDate } = req.body;
        const updaterId = req.user.userId; // user yang melakukan update

        const task = await taskRepo.update(parseInt(id), {
            title, description, status, priority,
            dueDate: dueDate ? new Date(dueDate) : undefined,
        });
        if (!task) return res.status(404).json({
            error: {
                code: 'NOT_FOUND',
                message: `Task ID ${id} tidak ditemukan.`
            }
        });

        // ── EMIT REAL-TIME EVENT ────────────────────────────
        const io = req.app.get('io');
        if (io) {
            // Broadcast ke semua user (room global) untuk update list
            io.to('tasks:global').emit('task:updated', { task });
            // Notifikasi personal ke user yang melakukan update
            io.to(`user:${updaterId}`).emit('notification', {
                type: 'INFO',
                title: 'Task Diperbarui',
                message: `Task "${task.title}" berhasil diperbarui.`,
            });
            // Jika updater adalah admin dan bukan pemilik task, notif pemilik juga
            if (req.user.role === 'ADMIN' && task.userId !== updaterId) {
                io.to(`user:${task.userId}`).emit('notification', {
                    type: 'INFO',
                    title: 'Task Diperbarui',
                    message: `Task "${task.title}" telah diperbarui oleh Admin.`,
                });
            }
        }

        res.status(200).json({ data: task });
    } catch (err) { next(err); }
};


const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ok = await taskRepo.remove(parseInt(id));
        if (!ok) return res.status(404).json({
            error: {
                code: 'NOT_FOUND',
                message: `Task ID ${id} tidak ditemukan.`
            }
        });

        // ── EMIT REAL-TIME EVENT ────────────────────────────
        const io = req.app.get('io');
        if (io) {
            io.to('tasks:global').emit('task:deleted', { taskId: parseInt(id) });
        }

        res.status(204).send();
    } catch (err) { next(err); }
};

const getTasksByUser = async (req, res, next) => {
    try {
        const result = await taskRepo.findByUser(req.params.userId);
        if (!result) return res.status(404).json({
            error: {
                code: 'NOT_FOUND',
                message: `User ID ${req.params.userId} tidak ditemukan.`
            }
        });
        res.status(200).json({
            data: {
                user: {
                    id: result.id, name: result.name, email:
                        result.email
                }, tasks: result.tasks, total: result.tasks.length
            },
        });
    } catch (err) { next(err); }
};

module.exports = {
    listTasks, createTask, getTask, replaceTask, updateTask, deleteTask,
    getTasksByUser
};