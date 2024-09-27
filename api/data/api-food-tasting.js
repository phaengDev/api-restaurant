const express = require('express');
const router = express.Router();
const db = require('../db');
router.post("/create", function (req, res) {
    const { tastingId,product_id_fk, tasting_name} = req.body;
    const tasting_price = parseFloat(req.body.tasting_price.replace(/,/g, ''));
    const tables='tbl_food_tasting';
    if(!tastingId){
        db.autoId(tables, 'tasting_id', (err, tasting_id) => {
        const fields = 'tasting_id,product_id_fk,tasting_name,tasting_price';
        const data = [tasting_id, product_id_fk,tasting_name,tasting_price];
        db.insertData(tables, fields, data, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ`  });
            }
            res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
        });
    })
    }else{
    const fieldUp = 'product_id_fk,tasting_name,tasting_price';
    const newData = [product_id_fk,tasting_name, tasting_price,tastingId];
    const condition = 'tasting_id=?';
    db.updateData(tables,fieldUp, newData, condition, (err, resultsUp) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: resultsUp });
    });
}
});


router.delete("/:id", async (req, res)=> {
    const tasting_id= req.params.id;
    const table = 'tbl_food_tasting';
    const where = `tasting_id=${tasting_id}`;
    db.deleteData(table, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ message: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});

router.get("/:id", function (req, res) {
    const product_id_fk=req.params.id;
    const  tables=`tbl_food_tasting`;
    const wheres=`product_id_fk=${product_id_fk}`;
    db.selectWhere(tables,'*',wheres, (err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});

module.exports = router;