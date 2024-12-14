import  User from '../../models/User.js'
import mongoose from 'mongoose'


const getUserList = async(req, res) =>{
    try {
        const { role = 'all', search = '', page = '1' } = req.query;

        const limit = 10;
        const pageIdx = parseInt(page, 10);

        const query = {
            ...(role !== 'all' && {role}),
            ...(search && {username: new RegExp(search,'i')})
        }

        //console.log(query)

        const userList = await User.find(query)
        .limit(limit)
        .skip((pageIdx-1)*limit)

        //console.log(userList)

        //console.log(role,search,pageIdx)
        res.render('admin/user/user_list',{role, search, page, userList});
    } catch (error) {
        console.log("Error fetching User's data: ", error.message);
        res.status(500).send('Server error:' + error.message);
    }
}

export default{
    getUserList,
}