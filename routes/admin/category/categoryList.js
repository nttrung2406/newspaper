import express from 'express'
const router = express.Router()

router.get('/category_list', (req,res) =>{
    res.render('admin/category/category_list')
})


export default router