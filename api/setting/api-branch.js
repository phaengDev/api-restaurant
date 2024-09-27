const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const currentDatetime = moment();
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');

router.post("/create", function (req, res) {
    const tables = 'tbl_branches';
    let myqrBank = '';
    const storage = multer.diskStorage({
        destination: function (req, qrBank, cb) {
            cb(null, './assets/qr');
        },
        filename: function (req, qrBank, cb) {
            const ext = path.extname(qrBank.originalname);
            myqrBank = `${Date.now()}${ext}`;
            cb(null, myqrBank);
        }
    });
    const upload = multer({ storage }).single('qrBank');
    upload(req, res, function (err) {
        const { branch_Id,shop_id_fk, branchName, district_id_fk, villageName, branchTel, type_branch, statusUse, branch_detail, bank_name, account_number } = req.body;
        if (branch_Id === '') {
            db.autoId(tables, 'branchId', (err, branchId) => {
                const code = branchId.toString().slice(-4).padStart(4, '0')
                const branchCode = 'BH-' + code;
                const fields = 'branchId,branchCode,shop_id_fk,branchName, district_id_fk,villageName,branchTel,type_branch,statusUse,branch_detail,bank_name,account_number,qrBank,createDate';
                const data = [branchId, branchCode, shop_id_fk,branchName, district_id_fk, villageName, branchTel, type_branch, statusUse, branch_detail, bank_name, account_number, myqrBank, dateTime];
                db.insertData(tables, fields, data, (err, results) => {
                    if (err) {
                        console.error('Error inserting data:', err);
                        return res.status(500).json({ error: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                    }
                    console.log('Data inserted successfully:', results);
                    res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
                });
            })
        } else {
            const where = `branchId='${branch_Id}'`;
            db.selectWhere(tables, '*', where, (err, results) => {
                if (results[0].qrBank && results[0].qrBank !== '' && myqrBank !== '') {
                    const filePath = path.join('assets/qr', results[0].qrBank);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting the existing file:', err);
                        }
                    });
                }
                let qrName = results[0].qrBank;
                if (myqrBank !== '') {
                    qrName = myqrBank;
                }
                const fieldUp = 'branchName, district_id_fk,villageName,branchTel,type_branch,statusUse,branch_detail,bank_name,account_number,qrBank';
                const newData = [branchName, district_id_fk, villageName, branchTel, type_branch, statusUse, branch_detail, bank_name, account_number, qrName, branch_Id];
                const condition = 'branchId=?';
                db.updateData(tables, fieldUp, newData, condition, (err, resultsUp) => {
                    if (err) {
                        console.error('Error updating data:', err);
                        return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
                    }
                    res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: resultsUp });
                });
            });
        }
    });
});


router.delete("/:id", async (req, res)=> {
    const branchId= req.params.id;
    const table = 'tbl_branches';
    const where = `branchId=${branchId}`;
    db.selectWhere(table, '*', where, (err, results) => {
        if (results[0].qrBank && results[0].qrBank !== '') {
            const filePath = path.join('assets/qr', results[0].qrBank);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting the existing file:', err);
                }
            });
        }

    db.deleteData(table, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ message: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ' });
    });
});
});

router.get("/:id", function (req, res) {
    const shop_id_fk=req.params.id;
    const table = `tbl_branches
    LEFT JOIN tbl_districts ON tbl_branches.district_id_fk=tbl_districts.district_id
    LEFT JOIN tbl_province ON tbl_districts.province_fk=tbl_province.province_id`;
    const wheres=`shop_id_fk=${shop_id_fk}`
    db.selectWhere(table,'*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto',wheres, (err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});
router.get("/option/:id", function (req, res) {
    const shop_id_fk=req.params.id;
    const table = `tbl_branches`;
      const wheres=`shop_id_fk=${shop_id_fk}`
    db.selectWhere(table,'*',wheres, (err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});

router.get("/:id", function (req, res) {
    const id = req.params.id;
    const where = `branchId=${id}`;
    db.singleAll('tbl_branches', where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});
module.exports = router
