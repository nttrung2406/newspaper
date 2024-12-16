import express from 'express'
import tagController from '../../../controllers/admin/tagController.js'

const router = express.Router();

router.route('/create')
.get((req,res)=>{
    const message = req.flash("tag_create_err")
    res.render('admin/tag/tag_create', {message})
})
.post(tagController.addTag)

router.route('/info/:id')
.get(tagController.viewTag)

router.route('/update/:id')
.get(tagController.getTagForUpdate)
.post(tagController.updateTag)

export default router;