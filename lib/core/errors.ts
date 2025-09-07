export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Not authenticated") { super(401, message); }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") { super(404, message); }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request") { super(400, message); }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") { super(403, message); }
}
