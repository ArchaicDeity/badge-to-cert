import type { Request, Response } from 'express';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/db', () => ({ db: {}, default: {} }));

import handler from '@/api/kiosk/course/[courseId]';

describe('kiosk course handler', () => {
  it('returns 400 for non-numeric courseId', async () => {
    const req = { method: 'GET', params: { courseId: 'abc' } } as unknown as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid courseId' });
  });
});
