const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
router.post("/create", function (req, res) {
    const { brandId,categories_id_fk, brand_name, brand_detail} = req.body;
    const tables='tbl_brands';
    if(!brandId){
        db.autoId(tables, 'brand_id', (err, brand_id) => {
        const code=brand_id.toString().slice(-4).padStart(4, '0')
        const brand_code='BN-'+code;
        const fields = 'brand_id,brand_code,categories_id_fk,brand_name,brand_detail';
        const data = [brand_id,brand_code, categories_id_fk,brand_name,brand_detail];
        db.insertData(tables, fields, data, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ`  });
            }
            console.log('Data inserted successfully:', results);
            res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
        });
    })
    }else{
    const fieldUp = 'categories_id_fk,brand_name,brand_detail';
    const newData = [categories_id_fk,brand_name, brand_detail,brandId];
    const condition = 'brand_id=?';
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
    const brand_id= req.params.id;
    const table = 'tbl_brands';
    const where = `brand_id=${brand_id}`;
    db.deleteData(table, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ message: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});

router.get("/:id", function (req, res) {
    const shop_id_fk=req.params.id;
    const  tables=`tbl_brands
    LEFT JOIN tbl_categories ON tbl_brands.categories_id_fk=tbl_categories.categories_id`;
    const wheres=`shop_id_fk=${shop_id_fk}`;
    db.selectWhere(tables,'*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto',wheres, (err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});
router.get("/cates/:id", function (req, res) {
    const cateId = req.params.id;
    const where = `categories_id_fk='${cateId}'`;
    db.selectWhere('tbl_brands','*', where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

router.get("/:id", function (req, res) {
    const id = req.params.id;
    const where = `brand_id=${id}`;
    db.singleAll('tbl_brands', where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});
module.exports = router
