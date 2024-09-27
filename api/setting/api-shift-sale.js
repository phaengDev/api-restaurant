const express=require('express');
const router=express.Router();
const db = require('../db');
const moment = require('moment');
const currentDatetime = moment();
router.post("/create", function (req, res) {
    const {shiftId,shift_name,time_in,time_out,branch_id_fk} = req.body;

    const timeIn=moment(time_in).format('HH:mm:ss')
    const timeOut=moment(time_out).format('HH:mm:ss')
    
    const table = 'tbl_shift_sale';
    if(shiftId===''){
        db.autoId(table, 'shift_id', (err, shift_id) => {
    const fields = 'shift_id, shift_name,time_in,time_out,branch_id_fk';
    const data = [shift_id, shift_name,timeIn,timeOut,branch_id_fk];
    db.insertData(table, fields, data, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ`  });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});
}else{
    const field = 'shift_name,time_in,time_out';
    const newData = [shift_name,time_in,time_out,shiftId]; 
    const condition = 'shift_id=?'; 
    db.updateData(table, field, newData, condition, (err, results) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
        }
        console.log('Data updated successfully:', results);
        res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
    });
}
});

router.delete("/:id", function (req, res) {
    const shift_id= req.params.id;
    const where=`shift_id='${shift_id}'`;
    db.deleteData('tbl_shift_sale', where, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
    });

    router.get("/:id", function (req, res, next) {
        const shop_id_fk=req.params.id;
        const wheres=`shop_id_fk=${shop_id_fk}`;
        const tables=`tbl_shift_sale
        LEFT JOIN tbl_branches ON tbl_shift_sale.branch_id_fk=tbl_branches.branchId`;
        db.selectWhere(tables,'*',wheres, (err, results) => {
            if (err) {
                return res.status(400).send();
            }
            res.status(200).json(results);
        });
        });

module.exports = router;