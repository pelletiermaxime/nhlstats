import { internalMutation } from "./_generated/server";

const divisionConferences: Record<string, string> = {
  Metropolitan: "EAST",
  Atlantic: "EAST",
  Central: "WEST",
  Pacific: "WEST",
};

export const migrateDivisionsAddConference = internalMutation({
  args: {},
  handler: async (ctx) => {
    const divisions = await ctx.db.query("divisions").collect();
    const updated: string[] = [];
    const skipped: string[] = [];

    for (const division of divisions) {
      if (division.conference) {
        skipped.push(`${division.name} (already has conference: ${division.conference})`);
        continue;
      }

      const conference = divisionConferences[division.name];
      if (conference) {
        await ctx.db.patch(division._id, { conference });
        updated.push(`${division.name} → ${conference}`);
      } else {
        skipped.push(`${division.name} (unknown division)`);
      }
    }

    return {
      updatedCount: updated.length,
      skippedCount: skipped.length,
      updated,
      skipped,
    };
  },
});

export const backfillPlayerSearchNames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const playerStats = await ctx.db.query("playerStats").collect();
    const updated: string[] = [];
    const skipped: string[] = [];

    for (const stat of playerStats) {
      if (stat.searchName) {
        skipped.push(`${stat.firstName} ${stat.lastName} (already has searchName)`);
        continue;
      }

      const searchName = `${stat.firstName} ${stat.lastName}`.toLowerCase();
      await ctx.db.patch(stat._id, { searchName });
      updated.push(`${stat.firstName} ${stat.lastName} → ${searchName}`);
    }

    return {
      updatedCount: updated.length,
      skippedCount: skipped.length,
      updated,
      skipped,
    };
  },
});
