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

import categoryList from './admin/category/categoryList.route.js'
router.use("/categories", categoryList)


import categoryAction from './admin/category/categoryAction.route.js'
router.use("/category", categoryAction)

import tagList from './admin/tag/tagList.route.js'
router.use("/tags", tagList)

import tagAction from './admin/tag/tagAction.route.js'
router.use("/tag", tagAction)

import userList from './admin/user/userList.route.js'
router.use('/users', userList)

import userAction from './admin/user/userAction.route.js'
router.use('/user',userAction)

import postList from './admin/post/postList.route.js'
router.use('/posts', postList)


export default router;