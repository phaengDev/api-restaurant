const express=require('express');
const router=express.Router();
const db = require('../db');
router.post("/create", function (req, res) {
    const {uniteId,unit_name,unit_detail,shop_id_fk} = req.body;
    const table = 'tbl_units';
    if(!uniteId){
        db.autoId(table, 'units_id', (err, units_id) => {
    const fields = 'units_id, unit_name,unit_detail,shop_id_fk';
    const data = [units_id, unit_name,unit_detail,shop_id_fk];
    db.insertData(table, fields, data, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ`,results  });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});


}else{
    const field = 'unit_name,unit_detail';
    const newData = [unit_name,unit_detail,uniteId]; 
    const condition = 'units_id=?'; 
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
    const units_id= req.params.id;
    const where=`units_id='${units_id}'`;
    db.deleteData('tbl_units', where, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
    });

    router.get("/:id", function (req, res, next) {
        const shop_id_fk=req.params.id;
        const wheres=`shop_id_fk=${shop_id_fk}`
        const tables=`tbl_units`;
        db.selectWhere(tables,'*',wheres, (err, results) => {
            if (err) {
                return res.status(400).send();
            }
            res.status(200).json(results);
        });
        });

module.exports = router;