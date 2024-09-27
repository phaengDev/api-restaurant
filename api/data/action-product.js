const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
router.post('/editstok', async function (req, res) {
    let myFileName = '';
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './assets/pos');
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            myFileName = `st-${Date.now()}${ext}`;
            cb(null, myFileName);
        }
    });
    const upload = multer({ storage }).single('image');
    upload(req, res, function (err) {
        const { stock_id, quantity, status_use,imageps } = req.body;
        const discount = parseFloat(req.body.discount.replace(/,/g, ''));
        const prices = parseFloat(req.body.prices.replace(/,/g, ''));

        let fileName = imageps;
        if (myFileName !== '') {
            fileName = myFileName;
        }


        const fields = `quantity,discount,prices,status_use,image`;
        const values = [quantity,discount,prices,status_use,fileName,stock_id];
        const condition = `stock_id=?`;
        db.updateData('tbl_porduct_stock', fields, values, condition, (err, results) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(200).json(results);
        })
    })
})


router.post("/fetch", async function (req, res) {
    const { productName, branch_id_fk, shop_id_fk } = req.body;
    if (!productName) {
        return res.status(400).json({ error: "Product name is required" });
    }
    const table = `tbl_porducts 
    LEFT JOIN tbl_units ON tbl_porducts.units_id_fk = tbl_units.units_id`;
    const fields = `product_id,product_code, product_name, price_sale, discount_sale, unit_name`;
    const where = `
    (product_name LIKE ? OR product_code LIKE ?) AND 
    tbl_porducts.shop_id_fk = ? AND 
    NOT EXISTS (
        SELECT 1
        FROM tbl_porduct_stock
        WHERE tbl_porduct_stock.product_id_fk = tbl_porducts.product_id
        AND tbl_porduct_stock.branch_id_fk = ?
    )`;
    const values = [`%${productName}%`, `%${productName}%`, shop_id_fk, branch_id_fk];
    db.queryData(table, fields, where, values, (err, results) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});

router.post("/fetchMt", async function (req, res) {
    const { branch_id_fk, shop_id_fk } = req.body;

    const table = `tbl_porducts 
    LEFT JOIN tbl_units ON tbl_porducts.units_id_fk = tbl_units.units_id`;
    const fields = `product_id,product_code, product_name, price_sale, discount_sale, unit_name`;
    const where = `tbl_porducts.shop_id_fk = ? AND 
    NOT EXISTS (
        SELECT 1
        FROM tbl_porduct_stock
        WHERE tbl_porduct_stock.product_id_fk = tbl_porducts.product_id
        AND tbl_porduct_stock.branch_id_fk = ?
    )`;
    const values = [shop_id_fk, branch_id_fk];
    db.queryData(table, fields, where, values, (err, results) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});


router.post("/setps", async function (req, res) {
    const { branch_id_fk, product_id } = req.body;
    const table = `tbl_setporduct
LEFT JOIN tbl_porducts ON tbl_setporduct.porduct_id_fk=tbl_porducts.product_id
LEFT JOIN tbl_units ON tbl_porducts.units_id_fk=tbl_units.units_id`;
    const fields = `tbl_setporduct.set_pos_id, 
	tbl_setporduct.branch_id_fk, 
	tbl_setporduct.porduct_main_fk, 
	tbl_setporduct.porduct_id_fk, 
	tbl_setporduct.quantity, 
	tbl_porducts.imgPos, 
	tbl_porducts.product_name, 
	tbl_porducts.product_code, 
	tbl_units.unit_name`;
    const where = `branch_id_fk=? AND porduct_main_fk=?`;
    const values = [branch_id_fk, product_id];
    db.queryData(table, fields, where, values, (err, results) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});



module.exports = router;