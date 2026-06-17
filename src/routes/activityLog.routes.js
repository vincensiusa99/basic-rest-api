const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/activityLog.controller');
const validate = require('../middleware/validate');
const {
    createActivityLogSchema,
    replaceActivityLogSchema,
    updateActivityLogSchema,
    listActivityLogsSchema,
} = require('../validators/activityLog.validator');

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Ambil daftar activity log
 *     tags: [ActivityLogs]
 *     parameters:
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID task
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID user
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATED, UPDATED, DELETED]
 *         description: Filter berdasarkan jenis aksi
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
 *         description: Berhasil mengambil daftar activity log
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLogList'
 */
router.get('/', validate(listActivityLogsSchema, 'query'), ctrl.listActivityLogs);

/**
 * @swagger
 * /activity-logs:
 *   post:
 *     summary: Buat activity log baru
 *     tags: [ActivityLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateActivityLog'
 *     responses:
 *       '201':
 *         description: Activity log berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLog'
 *       '400':
 *         description: Data tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validate(createActivityLogSchema, 'body'), ctrl.createActivityLog);

/**
 * @swagger
 * /activity-logs/{id}:
 *   get:
 *     summary: Ambil detail activity log berdasarkan ID
 *     tags: [ActivityLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID activity log
 *     responses:
 *       '200':
 *         description: Berhasil mengambil detail activity log
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLog'
 *       '404':
 *         description: Activity log tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', ctrl.getActivityLog);

/**
 * @swagger
 * /activity-logs/{id}:
 *   put:
 *     summary: Ganti seluruh data activity log berdasarkan ID
 *     tags: [ActivityLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID activity log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateActivityLog'
 *     responses:
 *       '200':
 *         description: Activity log berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLog'
 *       '400':
 *         description: Data tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Activity log tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', validate(replaceActivityLogSchema, 'body'), ctrl.replaceActivityLog);

/**
 * @swagger
 * /activity-logs/{id}:
 *   patch:
 *     summary: Perbarui sebagian data activity log berdasarkan ID
 *     tags: [ActivityLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID activity log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               action:
 *                 type: string
 *                 enum: [CREATED, UPDATED, DELETED]
 *               changes:
 *                 type: object
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       '200':
 *         description: Activity log berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLog'
 *       '400':
 *         description: Data tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Activity log tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id', validate(updateActivityLogSchema, 'body'), ctrl.updateActivityLog);

/**
 * @swagger
 * /activity-logs/{id}:
 *   delete:
 *     summary: Hapus activity log berdasarkan ID
 *     tags: [ActivityLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID activity log
 *     responses:
 *       '204':
 *         description: Activity log berhasil dihapus
 *       '404':
 *         description: Activity log tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', ctrl.deleteActivityLog);

module.exports = router;
