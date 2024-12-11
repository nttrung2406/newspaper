import express from 'express'
import tagController from '../../../controllers/admin/tagController.js'

const router = express.Router();

router.route('/create')
.get((req,res)=>{
    const message = req.flash("tag_create_err")
    res.render('admin/tag/tag_create', {message})
})
.post(tagController.addTag)

export default router;