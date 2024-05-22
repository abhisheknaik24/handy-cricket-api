import { Router } from 'express';
import teamController from '../controllers/teamController';

const router: Router = Router();

router.get('/', teamController.getTeams);

router.get('/:teamId', teamController.getTeam);

router.post('/', teamController.postTeam);

router.patch('/:teamId', teamController.patchTeam);

router.delete('/:teamId', teamController.deleteTeam);

export default router;
