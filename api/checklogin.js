const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const currentDatetime = moment();
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');
router.post("/check", function(req, res) {
    const {userEmail,userPass}=req.body;
    const table = `tbl_users
    LEFT JOIN tbl_staff ON tbl_users.staff_id_fk=tbl_staff.staff_id
    LEFT JOIN tbl_branches ON tbl_users.branch_id_fk=tbl_branches.branchId`; 
    const fields = "user_Id,uuid_user, staff_id_fk,tbl_users.branch_id_fk,tbl_branches.shop_id_fk,rights_id_fk, userEmail, userPassword,first_name, statuUse"; 
    const where = `userEmail = '${userEmail}' AND statuUse='1'`; 
    db.fetchSingle(table, fields, where, (err, results) => {
        if (err) {
            return res.status(400)
            .json({
                status: "400",
                message: "ຊື່ອີເມວບໍ່ຖືກຕ້ອງ"
            });
        }
        bcrypt.compare(userPass, results.userPassword, (bcryptErr, bcryptResult) => {
            if (bcryptErr || !bcryptResult) {
                return res.status(400)
                .json({
                    status: "400",
                    message: "ຫັດຜ່ານບໍ່ຖືກຕ້ອງ"
                });
            }

            // Sign a new JWT token
            const payload = {
                user_uuid: results.uuid_user,
                userEmail: results.userEmail,
                create_date: dateTime
            };
            jwt.sign(payload, 'your_secret_key',{ expiresIn: '1h' }, (signErr, token) => {
                if (signErr) {
                    return res.status(500).json({
                        status: "500",
                        message: "ເຊີບເວີພາຍໃນມີການຜິດພາດ"
                    });
                }
                res.status(200).json({
                    status: "200",
                    message: "ການເຂົ້າສູ້ລະບົບໄດສຳເລັດແລ້ວ",
                    token: token,
                    user_Id: results.user_Id,
                    user_uuid: results.uuid_user,
                    userEmail: results.userEmail,
                    username: results.first_name,
                    branch_Id: results.branch_id_fk,
                    shop_id_fk:results.shop_id_fk
                });
            });
        });
    });
});

router.post("/authen", function(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({
            status: "401",
            message: "Authorization token is missing"
        });
    }

    jwt.verify(token, 'your_secret_key', (verifyErr, decoded) => {
        if (verifyErr) {
            return res.status(401).json({
                status: "4011",
                message: "Invalid token"
            });
        }
        const userId = decoded.user_uuid;
        const userEmail = decoded.userEmail; 
         res.status(200).json({
            status:'OK',
            userId:userId,
            userEmail:userEmail
         })
    });
});
module.exports = router;
