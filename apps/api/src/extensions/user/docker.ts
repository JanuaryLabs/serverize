import parse from 'parse-duration';

export const defaultHealthCheck = (port: string | number) => ({
	Test: [
		`CMD wget --no-verbose --spider --tries=1 http://localhost:${port}/ || exit 1`,
	],
	Retries: 2,
	StartPeriod: parse('1s', 'nanosecond') || undefined,
	Timeout: parse('5s', 'nanosecond') || undefined,
	Interval: parse('30s', 'nanosecond') || undefined,
});
