export default (err, req, res, next) => {
    // Default error status and message
    let status = 500;
    let message = 'Internal server error';

    if (err.status || err.statusCode) {
        status = err.status || err.statusCode;
        message = err.message || message;
    }

    else if (err.isJoi) {
        status = 400;
        message = err.details[0].message.replace(/"/g, '');
    }

    else if (err.message) {
        message = err.message;
    }

  
    console.error('Error:', err);

    return res.status(status).json({
        status: false,
        message,
    });
};

