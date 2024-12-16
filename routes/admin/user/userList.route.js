import exp from 'constants';
import express from 'express'

const router = express.Router();

import userController from '../../../controllers/admin/userController.js'

router.route('/')
.get(userController.getUserList)

export default router;