import { asc, count, desc, gte, sql } from "drizzle-orm";

/**
 * Aggregated analytics summary returned to the dashboard.
 *
 * The summary is intentionally limited to what the admin dashboard needs:
 * total events, breakdowns by event name and event type, and a simple
 * time-series of events per day for the trailing 30 days.
 */

export type AnalyticsSummary = {
  totalEvents: number;
  eventTypeCounts: Record<string, number>;
  eventCounts: Record<string, number>;
  dailyTotals: { date: string; count: number }[];
  recentEvents: {
    name: string;
    eventType: string;
    createdAt: string;
  }[];
};

async function getDatabase() {
  const [{ db }, { analyticsEvents }] = await Promise.all([
    import("../../../../database/dist/drizzle/client.js"),
    import("../../../../database/dist/schema/analytics-events.js"),
  ]);

  return { db, analyticsEvents };
}

/**
 * Builds an aggregated analytics summary for the events stored in the
 * database. The query is read-only and uses simple group-by aggregations
 * that are supported by PostgreSQL.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { db, analyticsEvents } = await getDatabase();

  const now = new Date();
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000,
  );

  const [totalRow] = await db
    .select({ count: count() })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.timestamp, thirtyDaysAgo));

  const totalEvents = Number(totalRow?.count ?? 0);

  const eventTypeRows = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: count(),
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.timestamp, thirtyDaysAgo))
    .groupBy(analyticsEvents.eventType);

  const eventTypeCounts: Record<string, number> = {};
  for (const row of eventTypeRows) {
    eventTypeCounts[row.eventType] = Number(row.count);
  }

  const eventRows = await db
    .select({
      name: analyticsEvents.name,
      count: count(),
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.timestamp, thirtyDaysAgo))
    .groupBy(analyticsEvents.name)
    .orderBy(desc(count()));

  const eventCounts: Record<string, number> = {};
  for (const row of eventRows) {
    eventCounts[row.name] = Number(row.count);
  }

  const dailyRows = await db
    .select({
      date: sql<string>`to_date(${analyticsEvents.timestamp}::text, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.timestamp, thirtyDaysAgo))
    .groupBy(sql`to_date(${analyticsEvents.timestamp}::text, 'YYYY-MM-DD')`)
    .orderBy(asc(sql`to_date(${analyticsEvents.timestamp}::text, 'YYYY-MM-DD')`));

  const dailyTotals = dailyRows.map((row) => ({
    date: row.date,
    count: Number(row.count),
  }));

  const recentRows = await db
    .select({
      name: analyticsEvents.name,
      eventType: analyticsEvents.eventType,
      createdAt: analyticsEvents.timestamp,
    })
    .from(analyticsEvents)
    .orderBy(desc(analyticsEvents.timestamp))
    .limit(10);

  const recentEvents = recentRows.map((row) => ({
    name: row.name,
    eventType: row.eventType,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
  }));

  return {
    totalEvents,
    eventTypeCounts,
    eventCounts,
    dailyTotals,
    recentEvents,
  };
}