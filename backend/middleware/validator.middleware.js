const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({
        status: 'error',
        errors: errors.array()
    });
};

exports.validateRegister = [
    body('email').isEmail().withMessage('Correo electrónico inválido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('full_name').notEmpty().withMessage('El nombre completo es requerido'),
    body('rut').notEmpty().withMessage('El RUT es requerido'),
    validate
];

exports.validateLogin = [
    body('email').isEmail().withMessage('Correo electrónico inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    validate
];
