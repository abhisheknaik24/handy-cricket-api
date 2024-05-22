import { Router } from 'express';
import tournamentController from '../controllers/tournamentController';

const router: Router = Router();

router.get('/getTournaments', tournamentController.getTournaments);

router.get('/getTournament/:tournamentId', tournamentController.getTournament);

router.post('/postTournament', tournamentController.postTournament);

router.patch(
  '/patchTournament/:tournamentId',
  tournamentController.patchTournament
);

router.delete(
  '/deleteTournament/:tournamentId',
  tournamentController.deleteTournament
);

router.get(
  '/getTournamentTeams/:tournamentId',
  tournamentController.getTournamentTeams
);

router.post(
  '/postTournamentTeam/:tournamentId',
  tournamentController.postTournamentTeam
);

router.delete(
  '/deleteTournamentTeam/:tournamentTeamId',
  tournamentController.deleteTournamentTeam
);

router.get(
  '/getTournamentPointsTable/:tournamentId',
  tournamentController.getTournamentPointsTable
);

router.get(
  '/getTournamentQualifier/:tournamentId',
  tournamentController.getTournamentQualifier
);

export default router;
