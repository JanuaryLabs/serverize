import z from 'zod';
import { channelSchema, orgNameValidator } from '../zod';
export const emptyFaviconSchema = z.object({});
export const sayHiSchema = z.object({});
export const healthCheckSchema = z.object({});
