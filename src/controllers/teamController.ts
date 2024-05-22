import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const getTeams = async (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  try {
    const teams = await prisma.team.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Teams fetched successfully!',
      data: { teams: teams },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTeam = async (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { teamId } = req.params;

  if (!teamId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Team details fetched successfully!',
      data: { team: team },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const postTeam = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { logo, name }: { logo: string; name: string } = req.body;

  if (!logo?.length || !name?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request body is missing!',
    });
  }

  try {
    const teamExist = await prisma.team.findFirst({
      where: {
        name: name.trim().toLowerCase(),
        isActive: true,
      },
    });

    if (!!teamExist) {
      return res.status(200).json({
        success: false,
        message: 'Team already exist!',
      });
    }

    await prisma.team.create({
      data: {
        logo: logo.trim(),
        name: name.trim().toLowerCase(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Team added successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const patchTeam = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { teamId } = req.params;

  const { logo, name }: { logo: string; name: string } = req.body;

  if (!teamId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  if (!logo?.length || !name?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request body is missing!',
    });
  }

  try {
    const teamExist = await prisma.team.findFirst({
      where: {
        name: name.trim().toLowerCase(),
        isActive: true,
      },
    });

    if (!!teamExist) {
      return res.status(200).json({
        success: false,
        message: 'Team already exist!',
      });
    }

    await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        logo: logo.trim(),
        name: name.trim().toLowerCase(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Team updated successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTeam = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Request method is not allowed!',
    });
  }

  const { teamId } = req.params;

  if (!teamId?.length) {
    return res.status(200).json({
      success: false,
      message: 'Request params is missing!',
    });
  }

  try {
    await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Team deleted successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getTeams,
  getTeam,
  postTeam,
  patchTeam,
  deleteTeam,
};
