import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.use(express.static(path.join(__dirname,  "../public/admin")));
router.get("/", (req, res)=>{

    res.render("admin/dashboard")
});

import categoryList from './admin/category/categoryList.js'
router.use("/categories", categoryList)


import categoryAction from './admin/category/categoryAction.route.js'
router.use("/category", categoryAction)

export default router;