export default (schema, property = 'body') => {
    return (req, res, next) => {
        if (req[property] === undefined) {
            return res.status(400).json({ status: false, message: 'Invalid request' });
        }

        const { error } = schema.validate(req[property]);
        if (error) {
            const message = error.details[0].message.replace(/"/g, '');
            return res.status(400).json({ status: false, message: message });
        }
        next();
    };
};