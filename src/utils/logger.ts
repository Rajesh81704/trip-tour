import type { Request, Response, NextFunction } from "express";
import winston from "winston";
import path from "path";

const ANSI_COLORS = {
	reset: "\x1b[0m",
	method: "\x1b[36m",
	route: "\x1b[35m",
	ms: "\x1b[33m",
	status: "\x1b[32m",
};

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};

winston.addColors(colors);

const level = () => {
	const env = process.env.NODE_ENV || "development";
	const isDevelopment = env === "development";
	return isDevelopment ? "debug" : "warn";
};

const transports = [
	new winston.transports.Console({
		format: winston.format.combine(
			winston.format.timestamp({ format: "HH:mm:ss" }),
			winston.format.colorize({ all: true }),
			winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
		),
	}),

	new winston.transports.File({
		filename: path.join("logs", "error.log"),
		level: "error",
		format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	}),

	new winston.transports.File({
		filename: path.join("logs", "combined.log"),
		format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	}),
];

export const logger = winston.createLogger({
	level: level(),
	levels,
	transports,
});

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
	const start = process.hrtime.bigint();
	res.on("finish", () => {
		const end = process.hrtime.bigint();
		const latencyMs = Number(end - start) / 1_000_000;
		const method = `${ANSI_COLORS.method}${req.method}${ANSI_COLORS.reset}`;
		const route = `${ANSI_COLORS.route}${req.originalUrl}${ANSI_COLORS.reset}`;
		const ms = `${ANSI_COLORS.ms}${latencyMs.toFixed(2)} ms${ANSI_COLORS.reset}`;
		const status = `${ANSI_COLORS.status}${res.statusCode}${ANSI_COLORS.reset}`;
		logger.info(`[${method}] ${route} - ${status} - ${ms}`);
	});
	next();
}
