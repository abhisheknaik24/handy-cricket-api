import { Router } from 'express';
import matchController from '../controllers/matchController';

const router: Router = Router();

router.get('/:tournamentId/:tournamentTeamId', matchController.getMatches);

router.get('/getMatch/:tournamentId/:matchId', matchController.getMatch);

router.post('/:tournamentId', matchController.postMatches);

router.patch(
  '/patchPlayer/:tournamentId/:matchId',
  matchController.patchPlayer
);

router.patch('/patchToss/:tournamentId/:matchId', matchController.patchToss);

router.patch(
  '/patchTossChoose/:tournamentId/:matchId',
  matchController.patchTossChoose
);

router.patch('/patchRun/:tournamentId/:matchId', matchController.patchRun);

router.patch('/patchSkip/:tournamentId/:matchId', matchController.patchSkip);

export default router;
