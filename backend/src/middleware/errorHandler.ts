import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../services/geocodingService";

/**
 * Catch-all error handler. Express recognizes this as an error handler
 * because it takes 4 arguments.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error("[errorHandler]", err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}
