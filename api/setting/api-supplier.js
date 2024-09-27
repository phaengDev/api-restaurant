const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const currentDatetime = moment();
const dateNow = currentDatetime.format('YYYY-MM-DD');
router.post("/create", function (req, res) {
    const { supplierId, supplier_name, supplier_tel, district_id_fk, village_name, postal_code, road_number, supplier_detail, email, whatsapp, line, facebook ,shop_id_fk} = req.body;
    const table = 'tbl_supplier';
    if (supplierId === '') {
        db.autoId(table, 'supplier_id', (err, supplier_id) => {
            const code = supplier_id.toString().slice(-4).padStart(4, '0')
            const supplier_code = 'SPE-' + code;
            const fields = 'supplier_id,supplier_code, supplier_name,supplier_tel,district_id_fk,village_name,postal_code,road_number,supplier_detail,email,whatsapp,line,facebook,supplier_date,shop_id_fk';
            const data = [supplier_id, supplier_code, supplier_name, supplier_tel, district_id_fk, village_name, postal_code, road_number, supplier_detail, email, whatsapp, line, facebook, dateNow,shop_id_fk];
            db.insertData(table, fields, data, (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ error: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                }
                console.log('Data inserted successfully:', results);
                res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
            });
        });
    } else {
        const field = 'supplier_name,supplier_tel,district_id_fk,village_name,postal_code,road_number,supplier_detail,email,whatsapp,line,facebook';
        const newData = [supplier_name, supplier_tel, district_id_fk, village_name, postal_code, road_number, supplier_detail, email, whatsapp, line, facebook, supplierId];
        const condition = 'supplier_id=?';
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
    const supplier_id = req.params.id;
    const where = `supplier_id='${supplier_id}'`;
    db.deleteData('tbl_supplier', where, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        return res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});


router.get("/:id", function (req, res) {
    const shop_id_fk=req.params.id;
    const tables = `tbl_supplier
          LEFT JOIN tbl_districts ON tbl_supplier.district_id_fk=tbl_districts.district_id
        LEFT JOIN tbl_province ON tbl_districts.province_fk=tbl_province.province_id`;
    const field = `*`;
const wheres=`shop_id_fk=${shop_id_fk}`;
    db.selectWhere(tables, field,wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

router.get("/option/:id", function (req, res) {
    const shop_id_fk=req.params.id;
    const tables = `tbl_supplier`;
    const wheres=`shop_id_fk=${shop_id_fk}`;
    db.selectWhere(tables,'*',wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});


module.exports = router;
