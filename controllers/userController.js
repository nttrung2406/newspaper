import  User from '../../models/User.js'
import UserInformation from '../../models/UserInformation.js'
import mongoose from 'mongoose'
import bcrypt from "bcryptjs";

const getUserList = async(req, res) => {
    try {
        const { role = 'all', search = '', page = '1' } = req.query;

        const limit = 10;
        const pageIdx = Math.max(parseInt(page, 10), 1); // Ensure page is at least 1

        const query = {
            ...(role !== 'all' && {role}),
            ...(search && {username: new RegExp(search, 'i')})
        };

        
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        const userList = await User.find(query)
            .limit(limit)
            .skip((pageIdx - 1) * limit);

        const successMessage = req.flash('addSuccess') || req.flash('updateSuccess')

        // Render the user list view with pagination
        res.render('admin/user/user_list', {
            role, 
            search, 
            page: pageIdx, 
            totalPages,  
            userList,
            successMessage
        });
    } catch (error) {
        console.log("Error fetching User's data: ", error.message);
        res.status(500).send('Server error: ' + error.message);
    }
};


const addUser = async(req, res) =>{
    try {
        const {usernameadd, emailadd, fullnameadd, dobadd,roleadd, penameadd =  null} = req.body;
        console.log(usernameadd, emailadd, fullnameadd, dobadd,roleadd, penameadd)

        const checkExistingEmail = await User.findOne({email: emailadd});
        if (checkExistingEmail){
            const userList = await User.find()
            .limit(10)

            const error = "Email đã sử dụng."

            return res.json({success: false,  error})
        }


        const addUser = await User.create({
            username: usernameadd,
            email: emailadd,
            password: await bcrypt.hash('1234567890', 10),
            role: roleadd,
        })

        await UserInformation.create({
            accountID: addUser._id,
            fullname: fullnameadd,
            dateOfBirth: dobadd,
            penName: penameadd
        })

        req.flash('addSuccess',"Tài khoản đã thêm thành công.")
        
        return res.json({success: true})
       
    } catch (error) {
        console.log("Error adding a user:", error.message);
        res.status(500).send('server error: '+error.message);
    }
}

export default{
    getUserList,
    addUser
}