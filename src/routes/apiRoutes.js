import {Router} from 'express';
import {list,get,create,update,remove} from '../controllers/apiController.js';
const router=Router();
router.route('/tasks').get(list).post(create);
router.route('/tasks/:id').get(get).put(update).delete(remove);
export default router;
