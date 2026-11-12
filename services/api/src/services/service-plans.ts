import { asc, eq } from "drizzle-orm";

export type ServicePlan = {
  id: string;
  service: string;
  planName: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  active: boolean;
};

async function getDatabase() {
  const [{ db }, { servicePlans }] = await Promise.all([
    import("../../../../database/dist/drizzle/client.js"),
    import("../../../../database/dist/schema/service-plans.js"),
  ]);

  return { db, servicePlans };
}

/**
 * Returns all active pricing plans for the public website.
 */
export async function listActiveServicePlans(): Promise<ServicePlan[]> {
  const { db, servicePlans } = await getDatabase();

  const rows = await db
    .select({
      id: servicePlans.id,
      service: servicePlans.service,
      planName: servicePlans.planName,
      slug: servicePlans.slug,
      description: servicePlans.description,
      price: servicePlans.price,
      currency: servicePlans.currency,
      billingPeriod: servicePlans.billingPeriod,
      active: servicePlans.active,
    })
    .from(servicePlans)
    .where(eq(servicePlans.active, true))
    .orderBy(asc(servicePlans.service), asc(servicePlans.price));

  return rows;
}
