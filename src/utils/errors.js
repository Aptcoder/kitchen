// Base HTTP Error class
export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.statusCode = status;
        Error.captureStackTrace(this, this.constructor);
    }
}

// 400 Bad Request
export class BadRequestError extends HttpError {
    constructor(message = 'Bad request') {
        super(400, message);
    }
}

// 401 Unauthorized
export class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}

// 403 Forbidden
export class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden') {
        super(403, message);
    }
}

// 404 Not Found
export class NotFoundError extends HttpError {
    constructor(message = 'Not found') {
        super(404, message);
    }
}

// 409 Conflict
export class ConflictError extends HttpError {
    constructor(message = 'Conflict') {
        super(409, message);
    }
}

// 429 Too Many Requests
export class TooManyRequestsError extends HttpError {
    constructor(message = 'Too many requests') {
        super(429, message);
    }
}

// 500 Internal Server Error
export class InternalServerError extends HttpError {
    constructor(message = 'Internal server error') {
        super(500, message);
    }
}

