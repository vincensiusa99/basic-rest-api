// File: src/routes/tasks.routes.js
const express = require('express');
const router = express.Router();
const taskCtrl = require('../controllers/tasks.controller');
const activityLogCtrl = require('../controllers/activityLog.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { sanitizeBody } = require('../middleware/sanitize');
const { checkTaskOwnership } = require('../middleware/checkOwnership');
const {
    createTaskSchema,
    replaceTaskSchema,
    updateTaskSchema,
    listTasksSchema,
} = require('../validators/task.validator');

// Semua route di bawah butuh autentikasi
router.use(authenticate);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Ambil daftar task dengan pagination, filtering, dan sorting
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Pencarian pada title atau description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter berdasarkan prioritas
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman (maks 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Jumlah data yang dilewati
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, dueDate, priority, status]
 *         description: Field untuk sorting
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Arah sorting
 *     responses:
 *       '200':
 *         description: Berhasil mengambil daftar task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskList'
 */
// GET /api/v1/tasks — Semua user terautentikasi bisa lihat (filtered by userId di controller)
router.get('/', authorize('USER', 'ADMIN'), validate(listTasksSchema, 'query'), taskCtrl.listTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Buat task baru
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *     responses:
 *       '201':
 *         description: Task berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Data tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /api/v1/tasks — USER dan ADMIN bisa buat task
router.post('/', authorize('USER', 'ADMIN'), validate(createTaskSchema), sanitizeBody, taskCtrl.createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Ambil detail task berdasarkan ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID task
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET /api/v1/tasks/:id — User bisa lihat task sendiri, admin lihat semua
router.get('/:id', checkTaskOwnership, taskCtrl.getTask);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Ganti seluruh data task berdasarkan ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *     responses:
 *       200:
 *         description: Task berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Data tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// PUT /api/v1/tasks/:id — Hanya admin yang boleh ganti task secara keseluruhan
router.put('/:id', validate(replaceTaskSchema), authorize('ADMIN'), taskCtrl.replaceTask);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Perbarui sebagian data task berdasarkan ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Data tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// PATCH /api/v1/tasks/:id — Hanya pemilik atau admin
router.patch('/:id', checkTaskOwnership, validate(updateTaskSchema), taskCtrl.updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Hapus task berdasarkan ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID task
 *     responses:
 *       200:
 *         description: Task berhasil dihapus
 *       404:
 *         description: Task tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// DELETE /api/v1/tasks/:id — Hanya pemilik atau admin
router.delete('/:id', checkTaskOwnership, taskCtrl.deleteTask);

/**
 * @swagger
 * /tasks/{id}/activity:
 *   get:
 *     summary: Ambil activity log untuk task tertentu
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID task
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Jumlah data yang dilewati
 *     responses:
 *       '200':
 *         description: Berhasil mengambil activity log task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLogList'
 *       '404':
 *         description: Task tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET /api/v1/tasks/:id/activity-logs — User bisa lihat activity log task sendiri, admin lihat semua
router.get('/:id/activity', checkTaskOwnership, activityLogCtrl.getActivityLogsByTask);

module.exports = router;