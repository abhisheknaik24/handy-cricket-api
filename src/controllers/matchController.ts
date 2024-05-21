import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { shuffleArray } from '../lib/shuffleArray';

enum TossChoose {
  bat = 'bat',
  bowl = 'bowl',
}

const getMatches = async (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId, tournamentTeamId } = req.params;

  if (!tournamentId?.length || !tournamentTeamId?.length) {
    return res.status(500).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    let matches: any[] = [];

    if (tournamentTeamId === 'all') {
      matches = await prisma.match.findMany({
        where: {
          tournamentId: tournamentId,
          isActive: true,
        },
        include: {
          tournament: true,
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
          winnerTeam: true,
        },
        orderBy: {
          matchNo: 'asc',
        },
      });
    } else {
      matches = await prisma.match.findMany({
        where: {
          tournamentId: tournamentId,
          OR: [
            {
              teamOneId: tournamentTeamId,
            },
            {
              teamTwoId: tournamentTeamId,
            },
          ],
          isActive: true,
        },
        include: {
          tournament: true,
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
          winnerTeam: true,
        },
        orderBy: {
          date: 'asc',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Matches fetched successfully!',
      data: { matches: matches },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMatch = async (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId, matchId } = req.params;

  if (!tournamentId?.length || !matchId?.length) {
    return res.status(500).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
        tournamentId: tournamentId,
        isActive: true,
      },
      include: {
        tournament: true,
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
        playerTeam: true,
        tossWinnerTeam: true,
        winnerTeam: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Match details fetched successfully!',
      data: { match: match },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const postMatches = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId } = req.params;

  if (!tournamentId?.length) {
    return res.status(500).json({
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (tournamentTeams.length < 8) {
      return res.status(500).json({
        success: false,
        message: 'At least eight teams needed to make a matches!',
      });
    }

    const teamMatches: any[] = [];

    for (const teamOne of tournamentTeams) {
      for (const teamTwo of tournamentTeams) {
        if (
          teamOne.id !== teamTwo.id &&
          !teamMatches.some(
            (match) =>
              match.teamOneId === teamOne.id && match.teamTwoId === teamTwo.id
          ) &&
          !teamMatches.some(
            (match) =>
              match.teamOneId === teamTwo.id && match.teamTwoId === teamOne.id
          )
        ) {
          teamMatches.push({ teamOneId: teamOne.id, teamTwoId: teamTwo.id });
        }
      }
    }

    const matchData = shuffleArray(teamMatches)?.map((item, index) => ({
      matchNo: index + 1,
      tournamentId: tournamentId,
      teamOneId: item.teamOneId as string,
      teamTwoId: item.teamTwoId as string,
      date: new Date(),
      isActive: true,
    }));

    await prisma.match.createMany({
      data: matchData,
    });

    return res.status(200).json({
      success: true,
      message: 'Matches added successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const patchPlayer = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId, matchId } = req.params;

  const { playerTeamId }: { playerTeamId: string } = req.body;

  if (!tournamentId?.length || !matchId?.length) {
    return res.status(500).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  if (!playerTeamId?.length) {
    return res.status(500).json({
      success: false,
      message: 'Request body is missing!',
    });
  }

  try {
    const match = await prisma.match.update({
      where: {
        id: matchId,
        tournamentId: tournamentId,
      },
      data: {
        playerTeamId: playerTeamId,
      },
      include: {
        playerTeam: {
          include: {
            team: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Player team is set to ${match.playerTeam?.team?.name}`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const patchToss = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId, matchId } = req.params;

  if (!tournamentId?.length || !matchId?.length) {
    return res.status(500).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    const matchTeams = await prisma.match.findUnique({
      where: {
        id: matchId,
        tournamentId: tournamentId,
        playerTeamId: {
          not: null,
        },
        isActive: true,
      },
    });

    if (!matchTeams) {
      return res.status(500).json({
        success: false,
        message: 'Teams not found!',
      });
    }

    const teams = [matchTeams.teamOneId, matchTeams.teamTwoId];

    const randomTeamIndex = Math.floor(Math.random() * teams.length);

    let match = null;

    if (teams[randomTeamIndex] !== matchTeams.playerTeamId) {
      const tossChoose = ['bat', 'bowl'];

      const randomTossChooseIndex = Math.floor(
        Math.random() * tossChoose.length
      );

      match = await prisma.match.update({
        where: {
          id: matchId,
          tournamentId: tournamentId,
        },
        data: {
          tossWinnerTeamId: teams[randomTeamIndex],
          tossChoose: tossChoose[randomTossChooseIndex] as TossChoose,
          teamOneStatus:
            randomTeamIndex === 0
              ? (tossChoose[randomTossChooseIndex] as TossChoose)
              : randomTossChooseIndex === 0
              ? TossChoose.bowl
              : TossChoose.bat,
          teamTwoStatus:
            randomTeamIndex === 1
              ? (tossChoose[randomTossChooseIndex] as TossChoose)
              : randomTossChooseIndex === 0
              ? TossChoose.bowl
              : TossChoose.bat,
        },
        include: {
          tossWinnerTeam: {
            include: {
              team: true,
            },
          },
        },
      });
    } else {
      match = await prisma.match.update({
        where: {
          id: matchId,
          tournamentId: tournamentId,
        },
        data: {
          tossWinnerTeamId: teams[randomTeamIndex],
        },
        include: {
          tossWinnerTeam: {
            include: {
              team: true,
            },
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Toss winner is ${match.tossWinnerTeam?.team?.name}`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const patchTossChoose = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId, matchId } = req.params;

  const { tossChoose }: { tossChoose: string } = req.body;

  if (!tournamentId?.length || !matchId?.length) {
    return res.status(500).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  if (!tossChoose?.length) {
    return res.status(500).json({
      success: false,
      message: 'Request body is missing!',
    });
  }

  try {
    const matchDetails = await prisma.match.findUnique({
      where: {
        id: matchId,
        tournamentId: tournamentId,
      },
    });

    if (!matchDetails) {
      return res.status(500).json({
        success: false,
        message: 'Match details not found!',
      });
    }

    let match = null;

    if (matchDetails.playerTeamId === matchDetails.teamOneId) {
      match = await prisma.match.update({
        where: {
          id: matchId,
          tournamentId: tournamentId,
        },
        data: {
          tossChoose: tossChoose as TossChoose,
          teamOneStatus: tossChoose as TossChoose,
          teamTwoStatus: tossChoose === 'bat' ? 'bowl' : 'bat',
        },
      });
    } else {
      match = await prisma.match.update({
        where: {
          id: matchId,
          tournamentId: tournamentId,
        },
        data: {
          tossChoose: tossChoose as TossChoose,
          teamOneStatus: tossChoose === 'bat' ? 'bowl' : 'bat',
          teamTwoStatus: tossChoose as TossChoose,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: `You choose the ${match.tossChoose} first`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const patchRun = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId, matchId } = req.params;

  const { run }: { run: number } = req.body;

  if (!tournamentId?.length || !matchId?.length) {
    return res.status(500).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  if (run < 0 || run > 6) {
    return res.status(500).json({
      success: false,
      message: 'Request body is missing!',
    });
  }

  try {
    const matchDetails = await prisma.match.findUnique({
      where: {
        id: matchId,
        tournamentId: tournamentId,
      },
    });

    if (!matchDetails) {
      return res.status(500).json({
        success: false,
        message: 'Match details not found!',
      });
    }

    const oppositeTeamRun = Math.floor(Math.random() * 7);

    let match = null;

    if (matchDetails.teamOneStatus === 'bat') {
      const isPlayerTeamBat =
        matchDetails.playerTeamId === matchDetails.teamOneId;

      match = await prisma.match.update({
        where: {
          id: matchId,
          tournamentId: tournamentId,
        },
        data: {
          teamOneScore:
            Number(run) !== Number(oppositeTeamRun)
              ? isPlayerTeamBat
                ? Number(matchDetails.teamOneScore) + run
                : Number(matchDetails.teamOneScore) + oppositeTeamRun
              : Number(matchDetails.teamOneScore),
          teamOneWicket:
            Number(run) === Number(oppositeTeamRun)
              ? Number(matchDetails.teamOneWicket) + 1
              : Number(matchDetails.teamOneWicket),
          teamOneBalls: Number(matchDetails.teamOneBalls) - 1,
        },
      });

      if (match.inning === 'first') {
        if (Number(match.teamOneBalls) < 1) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              teamOneStatus: 'bowl',
              teamTwoStatus: 'bat',
              inning: 'second',
            },
          });
        } else if (Number(match.teamOneWicket) === 10) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              teamOneStatus: 'bowl',
              teamTwoStatus: 'bat',
              inning: 'second',
            },
          });
        }
      }

      if (match.inning === 'second') {
        if (Number(match.teamOneScore) > Number(match.teamTwoScore)) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              inning: 'over',
              winnerTeamId: match.teamOneId,
              loserTeamId: match.teamTwoId,
            },
          });
        } else if (Number(match.teamOneBalls) < 1) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              inning: 'over',
              winnerTeamId: match.teamTwoId,
              loserTeamId: match.teamOneId,
            },
          });
        } else if (Number(match.teamOneWicket) === 10) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              inning: 'over',
              winnerTeamId: match.teamTwoId,
              loserTeamId: match.teamOneId,
            },
          });
        }
      }
    } else if (matchDetails.teamTwoStatus === 'bat') {
      const isPlayerTeamBat =
        matchDetails.playerTeamId === matchDetails.teamTwoId;

      match = await prisma.match.update({
        where: {
          id: matchId,
          tournamentId: tournamentId,
        },
        data: {
          teamTwoScore:
            Number(run) !== Number(oppositeTeamRun)
              ? isPlayerTeamBat
                ? Number(matchDetails.teamTwoScore) + run
                : Number(matchDetails.teamTwoScore) + oppositeTeamRun
              : Number(matchDetails.teamTwoScore),
          teamTwoWicket:
            Number(run) === Number(oppositeTeamRun)
              ? Number(matchDetails.teamTwoWicket) + 1
              : Number(matchDetails.teamTwoWicket),
          teamTwoBalls: Number(matchDetails.teamTwoBalls) - 1,
        },
      });

      if (match.inning === 'first') {
        if (Number(match.teamTwoBalls) < 1) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              teamOneStatus: 'bat',
              teamTwoStatus: 'bowl',
              inning: 'second',
            },
          });
        } else if (Number(match.teamTwoWicket) === 10) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              teamOneStatus: 'bat',
              teamTwoStatus: 'bowl',
              inning: 'second',
            },
          });
        }
      }

      if (match.inning === 'second') {
        if (Number(match.teamTwoScore) > Number(match.teamOneScore)) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              inning: 'over',
              winnerTeamId: match.teamTwoId,
              loserTeamId: match.teamOneId,
            },
          });
        } else if (Number(match.teamTwoBalls) < 1) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              inning: 'over',
              winnerTeamId: match.teamOneId,
              loserTeamId: match.teamTwoId,
            },
          });
        } else if (Number(match.teamTwoWicket) === 10) {
          await prisma.match.update({
            where: {
              id: matchId,
              tournamentId: tournamentId,
            },
            data: {
              inning: 'over',
              winnerTeamId: match.teamOneId,
              loserTeamId: match.teamTwoId,
            },
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Match updated successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const patchSkip = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { tournamentId, matchId } = req.params;

  if (!tournamentId?.length || !matchId?.length) {
    return res.status(500).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    const matchDetails = await prisma.match.findUnique({
      where: {
        id: matchId,
        tournamentId: tournamentId,
      },
    });

    if (!matchDetails) {
      return res.status(500).json({
        success: false,
        message: 'Match details not found!',
      });
    }

    const teams = [matchDetails.teamOneId, matchDetails.teamTwoId];

    const randomTeamIndex = Math.floor(Math.random() * teams.length);

    const tossChoose = ['bat', 'bowl'];

    const randomTossChooseIndex = Math.floor(Math.random() * tossChoose.length);

    const teamOneScore = Math.floor(Math.random() * 100);

    const teamTwoScore = Math.floor(Math.random() * 100);

    await prisma.match.update({
      where: {
        id: matchId,
        tournamentId: tournamentId,
      },
      data: {
        playerTeamId: teams[randomTeamIndex],
        tossWinnerTeamId: teams[randomTeamIndex],
        tossChoose: 'bat',
        teamOneStatus:
          randomTeamIndex === 0
            ? (tossChoose[randomTossChooseIndex] as TossChoose)
            : randomTossChooseIndex === 0
            ? TossChoose.bowl
            : TossChoose.bat,
        teamOneScore: teamOneScore,
        teamOneWicket: Math.floor(Math.random() * 10),
        teamOneBalls: 0,
        teamTwoStatus:
          randomTeamIndex === 1
            ? (tossChoose[randomTossChooseIndex] as TossChoose)
            : randomTossChooseIndex === 0
            ? TossChoose.bowl
            : TossChoose.bat,
        teamTwoScore: teamTwoScore,
        teamTwoWicket: Math.floor(Math.random() * 10),
        teamTwoBalls: 0,
        inning: 'over',
        winnerTeamId:
          teamOneScore < teamTwoScore
            ? matchDetails.teamTwoId
            : matchDetails.teamOneId,
        loserTeamId:
          teamOneScore < teamTwoScore
            ? matchDetails.teamOneId
            : matchDetails.teamTwoId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Match updated successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getMatches,
  getMatch,
  postMatches,
  patchPlayer,
  patchToss,
  patchTossChoose,
  patchRun,
  patchSkip,
};
