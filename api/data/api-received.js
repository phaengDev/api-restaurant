const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const currentDatetime = moment();
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');
const timeNow = currentDatetime.format('HH:mm:ss');
// const fs = require('fs');
// const xlsx = require('xlsx');
// const mysql = require('mysql');
// const { el } = require('date-fns/locale');


router.post("/create", async function (req, res) {
    const { branch_id_fk, productList } = req.body;
    const table = 'tbl_received';
    try {
        const fieldReceive = 'branch_id_fk,product_id_fk,price_sale,quantity,create_date';
        const insertPromises = productList.map((product) => {
            return new Promise((resolve, reject) => {
                const { product_id,  quantity } = product;
                const price_sale = parseFloat(product.price_sale.replace(/,/g, ''));
                const whereCk = `branch_id_fk=${branch_id_fk} AND product_id_fk=${product_id}`;
                db.selectWhere('tbl_porduct_stock', '*', whereCk, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    if (results || results.length <= 0) {
                        const dataReceive = [branch_id_fk, product_id, price_sale, quantity, dateTime];
                        db.insertData(table, fieldReceive, dataReceive, (err, insertResults) => {
                            if (err) {
                                return reject(err);
                            }
                            const fieldEdit = `quantity=quantity+${quantity},prices=${price_sale}`;
                            db.updateField('tbl_porduct_stock', fieldEdit, whereCk, (err, editResults) => {
                                if (err) {
                                    return reject(err);  // Handle insertData error
                                }
                                resolve(editResults);
                            });
                        });
                    } else {
                        const fieldEdit = `quantity=quantity+${quantity},prices=${price_sale}`;
                        db.updateField('tbl_porduct_stock', fieldEdit, whereCk, (err, editResults) => {
                            if (err) {
                                return reject(err);  // Handle insertData error
                            }
                            resolve(editResults);
                        });
                    }
                })
            })
        })
        await Promise.all(insertPromises);
        res.status(200).json({ message: 'Stock added successfully' });
    } catch (error) {
        console.error('Error inserting stock:', error);
        res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສຍເລັດ` });
    }
});


//======================
router.post("/", function (req, res) {
    const { startDate, endDate, branch_id_fk, brands_id_fk, categories_id_fk } = req.body;


    let brandsId_fk = '';
    if (brands_id_fk) {
        brandsId_fk = `AND brands_id_fk='${brands_id_fk}'`;
    }
    let categoriesId_fk = '';
    if (categories_id_fk) {
        categoriesId_fk = `AND categories_id_fk='${categories_id_fk}'`;
    }
    const start_date = moment(startDate).format('YYYY-MM-DD');
    const end_date = moment(endDate).format('YYYY-MM-DD');

    const tables = `tbl_received 
    LEFT JOIN tbl_porducts ON tbl_received.product_id_fk=tbl_porducts.product_id
    LEFT JOIN tbl_brands ON tbl_porducts.brands_id_fk=tbl_brands.brand_id
    LEFT JOIN tbl_categories ON tbl_brands.categories_id_fk=tbl_categories.categories_id
    LEFT JOIN tbl_units ON tbl_porducts.units_id_fk=tbl_units.units_id`;
    const fields = `
    tbl_received.receive_id, 
	tbl_received.branch_id_fk, 
	tbl_received.product_id_fk, 
	tbl_received.price_sale, 
	tbl_received.quantity, 
	tbl_received.create_date, 
	tbl_porducts.imgPos, 
    tbl_porducts.product_code,
	tbl_porducts.product_name, 
	tbl_porducts.barcode, 
	tbl_brands.brand_name, 
	tbl_categories.categories_name, 
	tbl_units.unit_name`;
    const where = `tbl_received.branch_id_fk=${branch_id_fk} AND DATE(tbl_received.create_date) BETWEEN '${start_date}' AND '${end_date}' ${brandsId_fk} ${categoriesId_fk}`;
    db.selectWhere(tables, fields, where, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ message: 'An error occurred while fetching data.' });
        }
        res.status(200).json(results);
    });
});

router.post("/r-port", async function (req, res) {
    const { startDate, endDate, title_id_fk, option_id_fk, zone_id_fk } = req.body;
    let tilesId_fk = '';
    if (title_id_fk) {
        tilesId_fk = `AND tiles_id_fk='${title_id_fk}'`;
    }

    let optionId_fk = '';
    if (option_id_fk) {
        optionId_fk = `AND option_id_fk='${option_id_fk}'`;
    }
    let zoneId_fk = '';
    if (zone_id_fk) {
        zoneId_fk = `AND tbl_received.zone_id_fk='${zone_id_fk}'`;
    }
    const start_date = startDate.substring(0, 10);
    const end_date = endDate.substring(0, 10);

    const tableList = `tbl_received
    LEFT JOIN tbl_product ON tbl_received.product_id_fk=tbl_product.product_uuid
    LEFT JOIN tbl_product_tile ON tbl_product.tiles_id_fk=tbl_product_tile.tile_uuid
    LEFT JOIN tbl_unite ON tbl_product_tile.unite_id_fk=tbl_unite.unite_uuid`;
    const fieldList = `received_date,unite_name,old_quantity,received_qty`;
    const tables = `tbl_received
    LEFT JOIN tbl_product ON tbl_received.product_id_fk=tbl_product.product_uuid
    LEFT JOIN tbl_product_tile ON tbl_product.tiles_id_fk=tbl_product_tile.tile_uuid
    LEFT JOIN tbl_options ON tbl_product.option_id_fk=tbl_options.option_id
    LEFT JOIN tbl_unite ON tbl_product_tile.unite_id_fk=tbl_unite.unite_uuid
    LEFT JOIN tbl_zone_sale ON tbl_received.zone_id_fk=tbl_zone_sale.zone_Id`;
    const fields = 'product_id_fk, zone_id_fk, count(received_qty) as received_qty, DATE(received_date) as received_date, tile_name, code_id, unite_name, tiles_id_fk, qty_baht, zone_name, option_name';
    const where = `DATE(received_date) BETWEEN '${start_date}' AND '${end_date}' ${tilesId_fk} ${optionId_fk} ${zoneId_fk} GROUP BY product_id_fk,zone_id_fk,DATE(received_date)`;
    const results = await new Promise((resolve, reject) => {
        db.selectWhere(tables, fields, where, (err, results) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        })
    });
    for (let i = 0; i < results.length; i++) {
        const data = results[i];
        const createDate = moment(results[i].received_date).format('YYYY-MM-DD')
        const wherelist = `product_id_fk='${data.product_id_fk}' AND zone_id_fk='${data.zone_id_fk}' AND DATE(received_date)='${createDate}'`;
        const reDetail = await new Promise((resolve, reject) => {
            db.selectWhere(tableList, fieldList, wherelist, (err, reDetail) => {
                if (err) {
                    reject(err);
                }
                resolve(reDetail);
            });
        });
        data.detail = reDetail;
    }
    res.status(200).json(results);
});

router.post("/upload", function (req, res) {
    const workbook = xlsx.readFile('data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = xlsx.utils.sheet_to_json(worksheet);
    const { branch_id_fk, received_byid } = req.body;
    const table = 'tbl_received';
    const tableStock = 'tbl_stock_sale';
    const fieldStok = 'stock_sale_Id,branch_id_fk,product_id_fk,zone_id_fk,quantity,createDate';
    let productId_fk = '';
    excelData.forEach(row => {
        const stock_sale_Id = uuidv4();
        const received_id = uuidv4();

        let product_id_fk = row[1];
        let zone_id_fk = row[2];
        let quantity = row[3];
        let old_quantity = 0;

        // const dataStock = [stock_sale_Id, branch_id_fk, product_id_fk, zone_id_fk, quantity, dateTime];
        const wheresps = `code_id='${product_id_fk}'`;
        db.fetchSingle('tbl_product', 'product_uuid', wheresps, (err, resps) => {
            if (err) {
                return res.status(500).json({ message: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ ' });
            }
            if (resps) {
                productId_fk = resps.product_uuid;
            }
            const data = [received_id, branch_id_fk, productId_fk, zone_id_fk, old_quantity, quantity, dateTime, received_byid, dateTime];
            const fields = 'received_id,branch_id_fk,product_id_fk,zone_id_fk,old_quantity,received_qty,received_date,received_byid,create_date';
            db.insertData(table, fields, data, (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ ' });
                }
                res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
                // db.selectWhere(tableStock, '*', wheres, (err, ress) => {
                //     if (!ress || ress.length === 0) {
                //         db.insertData(tableStock, fieldStok, dataStock, (err, results) => {
                //             if (err) {
                //                 return res.status(500).json({ message: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
                //             }
                //             return res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ333', data: results });
                //         });
                //     } else {
                //         const fieldNew = `quantity = quantity + ${quantity} `;
                //         const condition = `product_id_fk='${product_id_fk}' AND zone_id_fk='${zone_id_fk}'`;
                //         db.updateField(tableStock, fieldNew, condition, (err, results) => {
                //             if (err) {
                //                 return res.status(500).json({ message: 'ບໍ່ພົບຂໍ້ມູນທີ່ຕ້ອງການດຳເນີນງານ' });
                //             }
                //             res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ2222', data: results });
                //         })
                //     }
                // });
            });
        });
    });
})

// });
module.exports = router