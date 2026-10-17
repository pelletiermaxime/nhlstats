/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation } from './_generated/server'

export const seed = mutation({
  args: {},
  handler: async (ctx: any) => {
    const existingTeams = await ctx.db.query('teams').collect()
    for (const team of existingTeams) {
      await ctx.db.delete(team._id)
    }

    const existingDivisions = await ctx.db.query('divisions').collect()
    for (const division of existingDivisions) {
      await ctx.db.delete(division._id)
    }

    const divisions = [
      { name: 'Metropolitan', conference: 'EAST' },
      { name: 'Atlantic', conference: 'EAST' },
      { name: 'Central', conference: 'WEST' },
      { name: 'Pacific', conference: 'WEST' },
    ]

    const divisionIds: any[] = []
    for (const division of divisions) {
      const id = await ctx.db.insert('divisions', division)
      divisionIds.push(id)
    }

    const teams = [
      {
        short_name: 'NJD',
        city: 'New Jersey',
        name: 'Devils',
        year: 2024,
        division_id: divisionIds[0],
      },
      {
        short_name: 'NYI',
        city: 'New York',
        name: 'Islanders',
        year: 2024,
        division_id: divisionIds[0],
      },
      {
        short_name: 'NYR',
        city: 'New York',
        name: 'Rangers',
        year: 2024,
        division_id: divisionIds[0],
      },
      {
        short_name: 'PHI',
        city: 'Philadelphia',
        name: 'Flyers',
        year: 2024,
        division_id: divisionIds[0],
      },
      {
        short_name: 'PIT',
        city: 'Pittsburgh',
        name: 'Penguins',
        year: 2024,
        division_id: divisionIds[0],
      },
      {
        short_name: 'CHI',
        city: 'Chicago',
        name: 'Blackhawks',
        year: 2024,
        division_id: divisionIds[2],
      },
      {
        short_name: 'CBJ',
        city: 'Columbus',
        name: 'Blue Jackets',
        year: 2024,
        division_id: divisionIds[0],
      },
      {
        short_name: 'DET',
        city: 'Detroit',
        name: 'Red Wings',
        year: 2024,
        division_id: divisionIds[1],
      },
      {
        short_name: 'BOS',
        city: 'Boston',
        name: 'Bruins',
        year: 2024,
        division_id: divisionIds[1],
      },
      {
        short_name: 'BUF',
        city: 'Buffalo',
        name: 'Sabres',
        year: 2024,
        division_id: divisionIds[1],
      },
      {
        short_name: 'ANA',
        city: 'Anaheim',
        name: 'Ducks',
        year: 2024,
        division_id: divisionIds[3],
      },
      {
        short_name: 'CGY',
        city: 'Calgary',
        name: 'Flames',
        year: 2024,
        division_id: divisionIds[3],
      },
      {
        short_name: 'CAR',
        city: 'Carolina',
        name: 'Hurricanes',
        year: 2024,
        division_id: divisionIds[0],
      },
      {
        short_name: 'COL',
        city: 'Colorado',
        name: 'Avalanche',
        year: 2024,
        division_id: divisionIds[2],
      },
      { short_name: 'DAL', city: 'Dallas', name: 'Stars', year: 2024, division_id: divisionIds[2] },
      {
        short_name: 'EDM',
        city: 'Edmonton',
        name: 'Oilers',
        year: 2024,
        division_id: divisionIds[3],
      },
      {
        short_name: 'FLA',
        city: 'Florida',
        name: 'Panthers',
        year: 2024,
        division_id: divisionIds[1],
      },
      {
        short_name: 'LAK',
        city: 'Los Angeles',
        name: 'Kings',
        year: 2024,
        division_id: divisionIds[3],
      },
      {
        short_name: 'MIN',
        city: 'Minnesota',
        name: 'Wild',
        year: 2024,
        division_id: divisionIds[2],
      },
      {
        short_name: 'MTL',
        city: 'Montreal',
        name: 'Canadiens',
        year: 2024,
        division_id: divisionIds[1],
      },
      {
        short_name: 'NSH',
        city: 'Nashville',
        name: 'Predators',
        year: 2024,
        division_id: divisionIds[2],
      },
      {
        short_name: 'OTT',
        city: 'Ottawa',
        name: 'Senators',
        year: 2024,
        division_id: divisionIds[1],
      },
      {
        short_name: 'SJS',
        city: 'San Jose',
        name: 'Sharks',
        year: 2024,
        division_id: divisionIds[3],
      },
      {
        short_name: 'SEA',
        city: 'Seattle',
        name: 'Kraken',
        year: 2024,
        division_id: divisionIds[3],
      },
      {
        short_name: 'STL',
        city: 'St. Louis',
        name: 'Blues',
        year: 2024,
        division_id: divisionIds[2],
      },
      {
        short_name: 'TBL',
        city: 'Tampa Bay',
        name: 'Lightning',
        year: 2024,
        division_id: divisionIds[1],
      },
      {
        short_name: 'TOR',
        city: 'Toronto',
        name: 'Maple Leafs',
        year: 2024,
        division_id: divisionIds[1],
      },
      { short_name: 'UTA', city: 'Utah', name: 'Mammoth', year: 2024, division_id: divisionIds[2] },
      {
        short_name: 'VAN',
        city: 'Vancouver',
        name: 'Canucks',
        year: 2024,
        division_id: divisionIds[3],
      },
      {
        short_name: 'VGK',
        city: 'Vegas',
        name: 'Golden Knights',
        year: 2024,
        division_id: divisionIds[3],
      },
      {
        short_name: 'WPG',
        city: 'Winnipeg',
        name: 'Jets',
        year: 2024,
        division_id: divisionIds[2],
      },
      {
        short_name: 'WSH',
        city: 'Washington',
        name: 'Capitals',
        year: 2024,
        division_id: divisionIds[0],
      },
    ]

    for (const team of teams) {
      await ctx.db.insert('teams', team)
    }
  },
})
