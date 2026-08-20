import { describe, expect, it } from 'vitest';

import { segmentASelectSql, segmentBSelectSql } from './sql.js';

describe('daily function executions v2 backfill SQL', () => {
    it('recomputes raw-event days with per-execution started seconds', () => {
        const sql = segmentBSelectSql('usage', '2026-08-18');

        expect(sql).toContain('FROM usage.raw_events FINAL');
        expect(sql).toContain("type = 'usage.function_executions' AND toDate(ts) = toDate('2026-08-18')");
        expect(sql).toContain('sum(toUInt64(ceil(coalesce(attributes.telemetryBag.durationMs::Nullable(UInt64), 0) / 1000.0))) AS duration_seconds');
        expect(sql).toContain('AS compute_gbs');
    });

    it('copies expired history from v1 with unrecoverable values set to zero', () => {
        const sql = segmentASelectSql('usage', '2026-05-18');

        expect(sql).toContain('FROM usage.daily_function_executions');
        expect(sql).toContain("WHERE day = toDate('2026-05-18')");
        expect(sql).toContain('toUInt64(0) AS duration_seconds');
        expect(sql).toContain('toFloat64(0) AS compute_gbs');
    });
});
