import { Router } from 'express';
import tournamentController from '../controllers/tournamentController';

const router: Router = Router();

router.get('/', tournamentController.getTournaments);

router.get('/:tournamentId', tournamentController.getTournament);

router.post('/', tournamentController.postTournament);

router.patch('/:tournamentId', tournamentController.patchTournament);

router.delete('/:tournamentId', tournamentController.deleteTournament);

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
