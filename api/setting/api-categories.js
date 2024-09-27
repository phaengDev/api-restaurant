const express=require('express');
const router=express.Router();
const db = require('../db');
router.post("/create", function (req, res) {
    const {categoriesId,categories_name,category_detail,shop_id_fk} = req.body;
    const table = 'tbl_categories';

    if(!categoriesId){
    db.autoId(table, 'categories_id', (err, categories_id) => {
    const code=categories_id.toString().slice(-4).padStart(4, '0')
    const cate_code = 'CGR-' + code;
    const fields = 'categories_id,cate_code,categories_name,category_detail,shop_id_fk';
    const data = [categories_id,cate_code,categories_name,category_detail,shop_id_fk];
    db.insertData(table, fields, data, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});
    }else{
    const field = 'categories_name,category_detail';
    const newData = [categories_name,category_detail,categoriesId]; 
    const condition = 'categories_id=?'; 
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



router.delete("/:id", async (req, res)=> {
    const categories_id= req.params.id;
    const table = 'tbl_categories';
    const where = `categories_id='${categories_id}'`;
    db.deleteData(table, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});

router.get("/:id", function (req, res) {
    const shop_id_fk=req.params.id;
    const wheres=`shop_id_fk=${shop_id_fk}`;
    db.selectWhere('tbl_categories','*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto',wheres,(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });

});


router.patch("/:id", function (req, res) {
  const categories_id= req.params.id;
  const where=`categories_id='${categories_id}'`;
  const fields=`*`;
    db.fetchSingle(`tbl_categories`,fields, where,(err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});
//=================================

router.get('/option/:id',function(req,res){
    const shop_id_fk=req.params.id;
    const wheres=`shop_id_fk=${shop_id_fk}`;
    db.selectWhere('tbl_categories','*',wheres,(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
})

module.exports=router