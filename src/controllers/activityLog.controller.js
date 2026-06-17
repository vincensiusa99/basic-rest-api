const activityLogRepo = require('../repositories/activityLog.repository');

const listActivityLogs = async (req, res, next) => {
    try {
        const { taskId, userId, action, limit, offset } = req.query;
        const { data, total } = await activityLogRepo.findAll({ taskId, userId, action, limit, offset });
        res.status(200).json({ data, pagination: { total, limit: Number(limit), offset: Number(offset) } });
    } catch (err) { next(err); }
};

const createActivityLog = async (req, res, next) => {
    try {
        const log = await activityLogRepo.create(req.body);
        res.status(201).set('Location', `/api/v1/activity-logs/${log.id}`).json({ data: log });
    } catch (err) { next(err); }
};

const getActivityLog = async (req, res, next) => {
    try {
        const log = await activityLogRepo.findById(req.params.id);
        if (!log) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `ActivityLog ID ${req.params.id} tidak ditemukan.` } });
        res.status(200).json({ data: log });
    } catch (err) { next(err); }
};

const replaceActivityLog = async (req, res, next) => {
    try {
        const log = await activityLogRepo.update(req.params.id, req.body);
        if (!log) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `ActivityLog ID ${req.params.id} tidak ditemukan.` } });
        res.status(200).json({ data: log });
    } catch (err) { next(err); }
};

const updateActivityLog = async (req, res, next) => {
    try {
        const log = await activityLogRepo.update(req.params.id, req.body);
        if (!log) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `ActivityLog ID ${req.params.id} tidak ditemukan.` } });
        res.status(200).json({ data: log });
    } catch (err) { next(err); }
};

const deleteActivityLog = async (req, res, next) => {
    try {
        const ok = await activityLogRepo.remove(req.params.id);
        if (!ok) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `ActivityLog ID ${req.params.id} tidak ditemukan.` } });
        res.status(204).send();
    } catch (err) { next(err); }
};

const getActivityLogsByTask = async (req, res, next) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const { data, total } = await activityLogRepo.findByTaskId(req.params.id, { limit, offset });
        res.status(200).json({ data, pagination: { total, limit: Number(limit), offset: Number(offset) } });
    } catch (err) { next(err); }
};

module.exports = {
    listActivityLogs,
    createActivityLog,
    getActivityLog,
    replaceActivityLog,
    updateActivityLog,
    deleteActivityLog,
    getActivityLogsByTask,
};
