import { Request, Response } from 'express';
import { calculateRunRate } from '../lib/calculateRunRate';
import { prisma } from '../lib/prisma';

const getTournaments = async (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Tournaments fetched successfully!',
      data: { tournaments: tournaments },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTournament = async (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId } = req.params;

  if (!tournamentId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      include: {
        teams: {
          where: {
            isActive: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament details fetched successfully!',
      data: { tournament: tournament },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const postTournament = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { image, name }: { image: string; name: string } = req.body;

  if (!image?.length || !name?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request body is missing!',
    });
  }

  try {
    const tournamentExist = await prisma.tournament.findFirst({
      where: {
        name: name.trim().toLowerCase(),
        isActive: true,
      },
    });

    if (!!tournamentExist) {
      return res.status(200).json({
        success: false,
        message: 'Tournament already exist!',
      });
    }

    await prisma.tournament.create({
      data: {
        image: image.trim(),
        name: name.trim().toLowerCase(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament added successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const patchTournament = async (req: Request, res: Response) => {
  if (req.method !== 'PATCH') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId } = req.params;

  const { image, name }: { image: string; name: string } = req.body;

  if (!tournamentId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  if (!image?.length || !name?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request body is missing!',
    });
  }

  try {
    const tournamentExist = await prisma.tournament.findFirst({
      where: {
        name: name.trim().toLowerCase(),
        isActive: true,
      },
    });

    if (!!tournamentExist) {
      return res.status(200).json({
        success: false,
        message: 'Tournament already exist!',
      });
    }

    await prisma.tournament.update({
      where: {
        id: tournamentId,
      },
      data: {
        image: image.trim(),
        name: name.trim().toLowerCase(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament updated successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTournament = async (req: Request, res: Response) => {
  if (req.method !== 'DELETE') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId } = req.params;

  if (!tournamentId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    await prisma.tournament.delete({
      where: {
        id: tournamentId,
      },
    });

    await prisma.match.deleteMany({
      where: {
        id: tournamentId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament deleted successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTournamentTeams = async (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId } = req.params;

  if (!tournamentId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: {
        tournamentId: tournamentId,
        isActive: true,
      },
      include: {
        team: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament teams fetched successfully!',
      data: { tournamentTeams: tournamentTeams },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const postTournamentTeam = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId } = req.params;

  const { teamId }: { teamId: string } = req.body;

  if (!tournamentId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  if (!teamId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request body is missing!',
    });
  }

  try {
    const tournamentTeamExist = await prisma.tournamentTeam.findFirst({
      where: {
        tournamentId: tournamentId,
        teamId: teamId,
        isActive: true,
      },
    });

    if (!!tournamentTeamExist) {
      return res.status(200).json({
        success: false,
        message: 'Tournament team already exist!',
      });
    }

    await prisma.tournamentTeam.create({
      data: {
        tournamentId: tournamentId,
        teamId: teamId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament team added successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTournamentTeam = async (req: Request, res: Response) => {
  if (req.method !== 'DELETE') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentTeamId } = req.params;

  if (!tournamentTeamId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    await prisma.tournamentTeam.delete({
      where: {
        id: tournamentTeamId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament team deleted successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTournamentPointsTable = async (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId } = req.params;

  if (!tournamentId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      include: {
        teams: {
          include: {
            team: true,
            teamOneMatches: true,
            teamTwoMatches: true,
            winnerTeamMatches: true,
            loserTeamMatches: true,
          },
        },
      },
    });

    if (!tournament?.teams?.length) {
      return res.status(200).json({
        success: false,
        message: 'Tournament teams not found!',
      });
    }

    let pointsTable: any[] = [];

    tournament?.teams?.forEach((item) => {
      const runRate = calculateRunRate(item);

      pointsTable.push({
        id: item?.id,
        team: item?.team?.name,
        totalMatches:
          Number(item?.teamOneMatches?.length) +
          Number(item?.teamTwoMatches?.length),
        playedMatches:
          Number(item?.winnerTeamMatches?.length) +
          Number(item?.loserTeamMatches?.length),
        wins: Number(item?.winnerTeamMatches?.length),
        losses: Number(item?.loserTeamMatches?.length),
        points: Number(item?.winnerTeamMatches?.length) * 2,
        runRate: !!runRate ? parseFloat(String(runRate)).toFixed(2) : 0,
      });
    });

    pointsTable.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      if (a.losses !== b.losses) {
        return a.losses - b.losses;
      }

      if (parseFloat(b.runRate) !== parseFloat(a.runRate)) {
        return parseFloat(b.runRate) - parseFloat(a.runRate);
      }

      return a.team.localeCompare(b.team);
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament points table fetched successfully!',
      data: { pointsTable: pointsTable },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTournamentQualifier = async (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId } = req.params;

  if (!tournamentId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      include: {
        teams: {
          include: {
            team: true,
            teamOneMatches: true,
            teamTwoMatches: true,
            winnerTeamMatches: true,
            loserTeamMatches: true,
          },
        },
        matches: true,
      },
    });

    if (!tournament?.teams?.length) {
      return res.status(200).json({
        success: false,
        message: 'Tournament teams not found!',
      });
    }

    let pointsTable: any[] = [];

    tournament?.teams?.forEach((item) => {
      pointsTable.push({
        id: item?.id,
        wins: Number(item?.winnerTeamMatches?.length),
        losses: Number(item?.loserTeamMatches?.length),
        points: Number(item?.winnerTeamMatches?.length) * 2,
        runRate: calculateRunRate(item),
      });
    });

    pointsTable.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      if (a.losses !== b.losses) {
        return a.losses - b.losses;
      }

      return parseFloat(b.runRate) - parseFloat(a.runRate);
    });

    const totalMatchesPlayed = await prisma.match.count({
      where: {
        tournamentId,
        winnerTeamId: {
          not: null,
        },
      },
    });

    if (
      !!tournament?.matches?.length &&
      !!totalMatchesPlayed &&
      Number(tournament?.matches?.length) === Number(totalMatchesPlayed)
    ) {
      const topFourTeams = pointsTable.slice(0, 4);

      const semiFinalMatchExist = await prisma.match.findMany({
        where: {
          tournamentId: tournamentId,
          type: 'semiFinal',
        },
      });

      if (!semiFinalMatchExist.length) {
        const nextMatchNo = await prisma.match.aggregate({
          _max: {
            matchNo: true,
          },
        });

        await prisma.match.createMany({
          data: [
            {
              matchNo: Number(nextMatchNo._max.matchNo),
              tournamentId: tournamentId,
              type: 'semiFinal',
              teamOneId: topFourTeams[0].id,
              teamTwoId: topFourTeams[3].id,
              date: new Date(),
              isActive: true,
            },
            {
              matchNo: Number(nextMatchNo._max.matchNo) + 1,
              tournamentId: tournamentId,
              type: 'semiFinal',
              teamOneId: topFourTeams[1].id,
              teamTwoId: topFourTeams[2].id,
              date: new Date(),
              isActive: true,
            },
          ],
        });
      }

      const finalMatchExist = await prisma.match.findMany({
        where: {
          tournamentId: tournamentId,
          type: 'final',
        },
      });

      if (!finalMatchExist.length) {
        const nextMatchNo = await prisma.match.aggregate({
          _max: {
            matchNo: true,
          },
        });

        const semiFinalWinners = await prisma.match.findMany({
          where: {
            tournamentId: tournamentId,
            type: 'semiFinal',
            winnerTeamId: {
              not: null,
            },
          },
          orderBy: {
            matchNo: 'asc',
          },
        });

        if (semiFinalWinners?.length === 2) {
          await prisma.match.create({
            data: {
              matchNo: Number(nextMatchNo._max.matchNo) + 1,
              tournamentId: tournamentId,
              type: 'final',
              teamOneId: semiFinalWinners[0].winnerTeamId as string,
              teamTwoId: semiFinalWinners[1].winnerTeamId as string,
              date: new Date(),
              isActive: true,
            },
          });
        }
      }
    }

    const matches = await prisma.match.findMany({
      where: {
        tournamentId: tournamentId,
        OR: [
          {
            type: 'semiFinal',
          },
          {
            type: 'final',
          },
        ],
      },
      include: {
        teamOne: {
          include: {
            team: true,
          },
        },
        teamTwo: {
          include: {
            team: true,
          },
        },
      },
      orderBy: {
        matchNo: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament qualifier fetched successfully!',
      data: { matches: matches },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getTournaments,
  getTournament,
  postTournament,
  patchTournament,
  deleteTournament,
  getTournamentTeams,
  postTournamentTeam,
  deleteTournamentTeam,
  getTournamentPointsTable,
  getTournamentQualifier,
};
