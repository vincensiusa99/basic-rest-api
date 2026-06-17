const Joi = require('joi');

const VALID_ACTIONS = ['CREATED', 'UPDATED', 'DELETED'];

const createActivityLogSchema = Joi.object({
    taskId: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'taskId harus berupa angka.',
            'number.integer': 'taskId harus berupa bilangan bulat.',
            'number.positive': 'taskId harus bernilai positif.',
            'any.required': 'taskId wajib diisi.',
        }),
    userId: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'userId harus berupa angka.',
            'number.integer': 'userId harus berupa bilangan bulat.',
            'number.positive': 'userId harus bernilai positif.',
            'any.required': 'userId wajib diisi.',
        }),
    action: Joi.string().valid(...VALID_ACTIONS).required()
        .messages({
            'any.only': `action harus salah satu dari: ${VALID_ACTIONS.join(', ')}.`,
            'any.required': 'action wajib diisi.',
        }),
    changes: Joi.object().unknown(true).required()
        .messages({
            'object.base': 'changes harus berupa objek JSON.',
            'any.required': 'changes wajib diisi.',
        }),
    createdAt: Joi.date().iso().optional(),
});

const replaceActivityLogSchema = Joi.object({
    taskId: Joi.number().integer().positive().required(),
    userId: Joi.number().integer().positive().required(),
    action: Joi.string().valid(...VALID_ACTIONS).required(),
    changes: Joi.object().unknown(true).required(),
    createdAt: Joi.date().iso().optional(),
});

const updateActivityLogSchema = Joi.object({
    taskId: Joi.number().integer().positive(),
    userId: Joi.number().integer().positive(),
    action: Joi.string().valid(...VALID_ACTIONS),
    changes: Joi.object().unknown(true),
    createdAt: Joi.date().iso(),
}).min(1).messages({
    'object.min': 'Minimal satu field harus diisi untuk update.',
});

const listActivityLogsSchema = Joi.object({
    taskId: Joi.number().integer().positive().optional(),
    userId: Joi.number().integer().positive().optional(),
    action: Joi.string().valid(...VALID_ACTIONS).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
});

module.exports = {
    createActivityLogSchema,
    replaceActivityLogSchema,
    updateActivityLogSchema,
    listActivityLogsSchema,
};
