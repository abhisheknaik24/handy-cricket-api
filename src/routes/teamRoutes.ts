import { Router } from 'express';
import teamController from '../controllers/teamController';

const router: Router = Router();

router.get('/getTeams', teamController.getTeams);

router.get('/getTeam/:teamId', teamController.getTeam);

router.post('/postTeam', teamController.postTeam);

router.patch('/patchTeam/:teamId', teamController.patchTeam);

router.delete('/deleteTeam/:teamId', teamController.deleteTeam);

export default router;
