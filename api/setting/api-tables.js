const express = require('express');
const router = express.Router();
const db = require('../db');
router.post("/create", function (req, res) {
    const { tablesId, tables_name, branch_id_fk, statsu_use } = req.body;
    const table = 'tbl_tables';
    if (!tablesId) {
        db.autoId(table, 'tables_id', (err, tables_id) => {
            const code = tables_id.toString().slice(-4).padStart(4, '0')
            const tables_code = 'TB-' + code;

            const fields = 'tables_id,tables_code, tables_name,branch_id_fk,statsu_use';
            const data = [tables_id, tables_code, tables_name, branch_id_fk, statsu_use];
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
        const field = 'tables_name,branch_id_fk,statsu_use';
        const newData = [tables_name, branch_id_fk, statsu_use, tablesId];
        const condition = 'tables_id=?';
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
    const tables_id = req.params.id;
    const where = `tables_id='${tables_id}'`;
    db.deleteData('tbl_tables', where, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});

router.get("/option/:id", function (req, res) {
    const branchId = req.params.id;
    const tables = `  tbl_tables
        LEFT JOIN tbl_branches ON tbl_tables.branch_id_fk = tbl_branches.branchId
        LEFT JOIN  (SELECT 
            table_id_fk, 
            COUNT(*) AS qtu_order, 
            SUM(total_price) AS balance_order
        FROM  tbl_order_cart GROUP BY  table_id_fk ) AS order_summary 
        ON tbl_tables.tables_id = order_summary.table_id_fk`;
    const fields = ` tables_id,
		tables_code,
		tables_name,
		useSale,
		branch_id_fk,
		statsu_use,
		branchName, 
    COALESCE(order_summary.qtu_order, 0) AS qtu_order, 
    COALESCE(order_summary.balance_order, 0) AS balance_order`;
    const wheres = `statsu_use='1' AND branch_id_fk=${branchId}`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

router.get("/:id", function (req, res) {
    const shop_id_fk = req.params.id;
    const tables = `tbl_tables
        LEFT JOIN tbl_branches ON tbl_tables.branch_id_fk=tbl_branches.branchId`;
    const wheres = `shop_id_fk=${shop_id_fk}`;
    db.selectWhere(tables, '*', wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

module.exports = router;