import { type HonoEnv } from '@workspace/utils';
import { Hono } from 'hono';
const router = new Hono<HonoEnv>();
export default ['/', router] as const;
