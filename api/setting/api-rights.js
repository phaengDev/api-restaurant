const express=require('express');
const router=express.Router();
const db = require('../db');
router.post("/create", function (req, res) {
    const {rightsId,rights_name,status_use,status_edit,status_delete,shop_id_fk} = req.body;
    const table = 'tbl_use_rights';
    if(rightsId===''){
        db.autoId(table, 'rights_id', (err, rights_id) => {
    const fields = 'rights_id, rights_name,status_use,status_edit,status_delete,shop_id_fk';
    const data = [rights_id, rights_name,status_use,status_edit,status_delete,shop_id_fk];
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
    const field = 'rights_name,status_use,status_edit,status_delete';
    const newData = [rights_name,status_use,status_edit,status_delete,rightsId]; 
    const condition = 'rights_id=?'; 
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

router.delete("/:id", function (req, res, next) {
    const rights_id= req.params.id;
    const where=`rights_id='${rights_id}'`;
    db.deleteData('tbl_use_rights', where, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
    });

    router.get("/", function (req, res, next) {
        const shop_id_fk=req.params.id;
        const tables=`tbl_use_rights`;
        const wheres=`shop_id_fk=${shop_id_fk}`;
        db.selectWhere(tables,'*',wheres, (err, results) => {
            if (err) {
                return res.status(400).send();
            }
            res.status(200).json(results);
        });
        });

module.exports = router;