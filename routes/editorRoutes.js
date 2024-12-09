import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.use(express.static(path.join(__dirname,  "../public/editor")));
router.get("/", (req, res)=>{

    res.render("editor/dashboard")
});

import categoryList from './editor/category/categoryList.js'
router.use("/categories", categoryList)


import categoryAction from './editor/category/categoryAction.route.js'
router.use("/category", categoryAction)

export default router;