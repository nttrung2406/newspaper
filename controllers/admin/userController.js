import User from '../../models/User.js'
import UserInformation from '../../models/UserInformation.js'
import mongoose from 'mongoose'
import bcrypt from "bcryptjs";
import Category from '../../models/Category.js';
import { populate } from 'dotenv';

const getUserList = async (req, res) => {
    try {
        const { role = 'all', search = '', page = '1' } = req.query;

        const limit = 10;
        const pageIdx = Math.max(parseInt(page, 10), 1); // Ensure page is at least 1

        const query = {
            ...(role !== 'all' && { role }),
            ...(search && { username: new RegExp(search, 'i') })
        };


        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        const userList = await User.find(query)
            .limit(limit)
            .skip((pageIdx - 1) * limit)
            .sort({ createdAt: -1 });

        const addSuccess = req.flash('addSuccess');
        const updateSuccess = req.flash('updateSuccess');
        const successMessage = addSuccess.length > 0 ? addSuccess[0] : updateSuccess[0] || '';


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


const addUser = async (req, res) => {
    try {
        const { usernameadd, emailadd, fullnameadd, dobadd, roleadd, pennameadd = null } = req.body;
        //console.log(usernameadd, emailadd, fullnameadd, dobadd,roleadd, penameadd)

        const checkExistingEmail = await User.findOne({ email: emailadd });
        if (checkExistingEmail) {
            const userList = await User.find()
                .limit(10)

            const error = "Email đã sử dụng."

            return res.json({ success: false, error })
        }

        const membership = {
            type: 'basic',
            startDate: Date.now(),
            endDate: Date.now(),
            status: 'inactive'
        }

        const addUser = await User.create({
            username: usernameadd,
            email: emailadd,
            membership: membership,
            password: await bcrypt.hash('1234567890', 10),
            role: roleadd,
            membership: {
                type: "basic",
                startDate: Date.now(),
                endDate: Date.now(),
                status: "inactive"
            },
        })


        //console.log("pemnameadd", pennameadd, fullnameadd, dobadd, addUser._id)
        await UserInformation.create({
            accountID: addUser._id,
            fullname: fullnameadd,
            dateOfBirth: dobadd,
            penName: pennameadd,
            contact: emailadd,
        })

        req.flash('addSuccess', "Tài khoản đã thêm thành công.")

        return res.json({ success: true })

    } catch (error) {
        console.log("Error adding a user:", error.message);
        res.status(500).send('server error: ' + error.message);
    }
}

const viewUserDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await UserInformation.findOne({ accountID: id })
            .populate({
                path: 'accountID',
                populate: {
                    path: 'category',
                    select: 'categoryName',
                },
            });

        console.log(user.accountID.category)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            accountID: user.accountID,
            fullname: user.fullname,
            dateOfBirth: user.dateOfBirth,
            penName: user.penName,
            contact: user.contact,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { usernameUpdate, fullnameUpdate, dobUpdate, pennameUpdate, contactUpdate } = req.body;
        //console.log("update user", id, usernameUpdate, fullnameUpdate, dobUpdate, pennameUpdate)
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.username = usernameUpdate;
        user.updatedAt = Date.now();
        await user.save();



        const userInfo = await UserInformation.findOne({ accountID: id });
        if (userInfo) {
            userInfo.fullname = fullnameUpdate;
            userInfo.dateOfBirth = dobUpdate;
            userInfo.penName = pennameUpdate;
            userInfo.contact = contactUpdate;
            await userInfo.save();
        }

        req.flash('updateSuccess', "Cập nhật thông tin tài khoản thành công.");
        res.json({ success: true });
    } catch (error) {
        console.log("Error updating user:", error.message);
        res.status(500).json({ message: "Server error", error });
    }
};


const getPremiumUSer = async (req, res) => {
    try {

        const now = new Date();

        const userList = await User.find({ role: 'membership' })

        const tableRows = userList.map(user => {
            const isPremiumActive = user.membership.endDate > now;
            const premiumStatus = user.membership.endDate > now ? "Active" : "Expired"
            let timeRemaining = "0 days, 0 hours, 0 minutes";
            if (isPremiumActive) {
                const remainingTimeInMs = user.membership.endDate - now;
                const remainingDays = Math.floor(remainingTimeInMs / (1000 * 60 * 60 * 24));
                const remainingHours = Math.floor((remainingTimeInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const remainingMinutes = Math.floor((remainingTimeInMs % (1000 * 60 * 60)) / (1000 * 60));

                timeRemaining = `${remainingDays} ngày, ${remainingHours} giờ, ${remainingMinutes} phút`;
            }
            const badgeClass = isPremiumActive ? 'badge badge-outline-warning' : 'badge badge-outline-success';

            const minDate = isPremiumActive
                ? user.membership.endDate.toISOString().slice(0, 16)
                : now.toISOString().slice(0, 16);

            return `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="${badgeClass}">${premiumStatus}</span></td>
                <td>${timeRemaining}</td>
                <td>
                    <input type="datetime-local" class="form-control" id="extendDate-${user._id}" min="${minDate}">
                </td>
                <td>
                    <button type="button" class="btn btn-success btn-sm" onclick="submitExtension('${user._id}')">Submit</button>
                </td>
            </tr>
            `
        }).join("")
        //console.log(tableRows)
        res.json({ tableRows })

    } catch (error) {
        console.log("Error fetching User's data: ", error.message);
        res.status(500).send('Server error: ' + error.message);
    }
}

const extendPremium = async (req, res) => {
    try {
        const { id, extendDate } = req.body;

        if (!id || !extendDate) {
            return res.status(400).json({ success: false, error: 'Missing userId or extendDate.' });
        }
        const now = new Date();
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        const newEndDate = new Date(extendDate);
        user.membership.startDate = user.membership.endDate < now ? now : user.membership.startDate
        user.membership.endDate = newEndDate;
        user.membership.status = "active"
        user.membership.type = "premium"
        // Save the updated user
        await user.save();

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error("Error updating User's premium: ", error.message);
        res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
};

const getEditorList = async (req, res) => {
    try {
        // Fetch the list of editors with their associated categories
        const editorList = await User.find({ role: 'editor' })

        for (let item of editorList) {
            const ret = await UserInformation.findOne({ accountID: item.id })
            item['fullname'] = ret ? ret.fullname : ""
        }

        // Generate table rows dynamically for each editor
        const tableRows = editorList.map((editor) => {
            return `
            <tr>
                <td>${editor.username}</td>
                <td>${editor.email}</td>
                <td>${editor.fullname}</td>
                <td>
                    <button class="btn btn-primary" onclick="assignCategory('${editor._id}')">Assign</button>
                </td>
            </tr>
            `;
        }).join(''); // Join all rows into a single string
        //console.log(tableRows)
        // Respond with the HTML for table rows
        res.json({ success: true, rows: tableRows });
    } catch (error) {
        console.error("Error fetching Editor's data: ", error.message);
        res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
}


const getAssignCategory = async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the provided ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid editor ID.' });
        }

        // Find the editor by ID
        const editor = await User.findById(id);

        if (!editor) {
            return res.status(404).json({ success: false, error: 'Editor not found.' });
        }

        // Fetch all categories with a parentID (child categories)
        const categories = await Category.find({ parentID: { $ne: null } });

        // Generate the <option> elements for the dropdown
        const categoriesURL = categories.map((item) => {
            return `
            <option value="${item._id}" ${editor.category.includes(item._id) ? 'selected' : ''}>
                ${item.categoryName}
            </option>`;
        }).join('');
        //console.log(categoriesURL)
        // Respond with t   he generated dropdown
        res.status(200).json({ success: true, categories: categoriesURL });
    } catch (error) {
        console.error("Error fetching editor's categories: ", error.message);
        res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
};

const assignCategory = async (req, res) => {
    try {
        const { id, categoryIDList } = req.body;

        // Validate the editor ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid editor ID.' });
        }

        // Find the editor by ID
        const editor = await User.findById(id);

        if (!editor) {
            return res.status(404).json({ success: false, error: 'Editor not found.' });
        }

        // Update the editor's categories
        editor.category = categoryIDList; // Overwrite categories with the new list
        await editor.save(); // Save changes to the database

        res.status(200).json({ success: true, message: 'Categories successfully assigned.' });
    } catch (error) {
        console.error("Error assigning categories:", error.message);
        res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
};

const grantMembership = async (req, res) => {
    try {
        const { id } = req.body;

        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID.' });
        }

        // Find the user by ID
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        // Check if the user's role is 'guest'
        if (user.role !== "guest") {
            return res.status(400).json({ success: false, error: 'Only guests can be granted membership.' });
        }

        const now = new Date();

        // Update membership details
        user.membership = {
            startDate: now,
            endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Add 7 days in milliseconds
            status: 'active',
            type: 'premium'
        };

        // Update user role to 'membership'
        user.role = 'membership';

        // Save the updated user document
        await user.save();

        res.json({ success: true, message: 'Membership granted successfully.' });
    } catch (error) {
        console.error("Error granting membership:", error.message);
        res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
};



export default {
    getUserList,
    addUser,
    viewUserDetail,
    updateUser,
    getPremiumUSer,
    extendPremium,
    getEditorList,
    getAssignCategory,
    assignCategory,
    grantMembership
}