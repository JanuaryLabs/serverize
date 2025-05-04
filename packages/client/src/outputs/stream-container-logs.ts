import z from 'zod';
import type * as http from '../http';
import { type UnauthorizedErr } from '../models/UnauthorizedErr.ts';

/**
 * Response for 200
 */
export type StreamContainerLogsOutput200 = ReadableStream;

/**
 * Unauthorized
 */
export type StreamContainerLogsOutput401 = UnauthorizedErr;
