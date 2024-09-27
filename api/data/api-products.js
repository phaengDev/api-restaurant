const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const currentDatetime = moment();
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');

router.post("/create", async function (req, res) {
    let myFileName = '';
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './assets/pos');
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            myFileName = `${Date.now()}${ext}`;
            cb(null, myFileName);
        }
    });
    const table = 'tbl_porducts';
    const upload = multer({ storage }).single('imgPos');
    upload(req, res, function (err) {
        const generateRandomBarcode = (length = 12) => {
            const charset = '00000001';
            let barcode = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                barcode += charset[randomIndex];
            }
            return barcode;
        };
        // Usage example
        const randomBarcode = generateRandomBarcode();
        const { productId, shop_id_fk, barcode, product_name, brands_id_fk, units_id_fk, price_buy, price_sale, discount_sale, status_stock, qty_alert, statusUse } = req.body;
        const priceBuy = parseFloat(price_buy.replace(/,/g, ''));
        const priceSale = parseFloat(price_sale.replace(/,/g, ''));
        if (!productId && productId === '') {
            db.autoId(table, 'product_id', (err, product_id) => {
                const code = product_id.toString().slice(-4).padStart(4, '0')
                let product_code = 'BPS-' + code;
                if (barcode) {
                    randomBarcode = barcode;
                }
                const fields = 'product_id,product_code,shop_id_fk,imgPos,product_name,barcode,brands_id_fk,units_id_fk,price_buy,price_sale,discount_sale,status_stock,qty_alert,statusUse';
                const data = [product_id, product_code, shop_id_fk, myFileName, product_name, randomBarcode, brands_id_fk, units_id_fk, priceBuy, priceSale, discount_sale, status_stock, qty_alert, statusUse];
                db.insertData(table, fields, data, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error saving product data' });
                    }
                    res.status(200).json({ message: 'Operation successful', data: results });
                });
            });


        } else {
            const where = `product_id='${productId}'`;
            db.selectWhere(table, '*', where, (err, results) => {
                if (results[0].imgPos && results[0].imgPos !== '' && myFileName !== '') {

                    const filePath = path.join('assets/pos', results[0].imgPos);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting the existing file:', err);
                        }
                    });
                }
                let fileName = results[0].imgPos;
                if (myFileName !== '') {
                    fileName = myFileName;
                }
                const field = 'imgPos,product_name,barcode,brands_id_fk,units_id_fk,price_buy,price_sale,discount_sale,status_stock,qty_alert';
                const newData = [fileName, product_name, barcode, brands_id_fk, units_id_fk, price_buy, price_sale, discount_sale, status_stock, qty_alert, productId];
                const condition = 'product_id=?';
                db.updateData(table, field, newData, condition, (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
                    }
                    res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
                });
            });
        }
    });
});
//============== porduct set===============

router.post('/set', function (req, res) {
    const { branch_id_fk, porduct_main_fk, datalist } = req.body;
    const fields = 'branch_id_fk,porduct_main_fk,porduct_id_fk,quantity';

    const promises = datalist.map(product => {
        const values = [branch_id_fk, porduct_main_fk, product.product_id_fk, product.quantity];
        return new Promise((resolve, reject) => {
            const whereCk = `branch_id_fk='${branch_id_fk}' AND porduct_main_fk=${porduct_main_fk} AND porduct_id_fk=${product.product_id_fk}`;

            db.selectWhere('tbl_setporduct', '*', whereCk, (err, results) => {
                if (err) {
                    return reject(new Error('Error in selectWhere: ' + err.message));  // Handle selectWhere error
                }

                if (!results || results.length === 0) {
                    db.insertData('tbl_setporduct', fields, values, (err, resultsList) => {
                        if (err) {
                            return reject(new Error('Error in insertData: ' + err.message));
                        }
                        resolve(resultsList);
                    });
                } else {
                    resolve(null);  // No insertion needed, record already exists
                }
            });
        });
    });

    Promise.all(promises)
        .then((results) => {
            const insertedResults = results.filter(result => result !== null);  // Filter out nulls
            res.status(200).json({ message: 'Data inserted successfully', results: insertedResults });
        })
        .catch((error) => {
            console.error('Error inserting data:', error);
            res.status(500).json({ message: 'Error inserting data', error });
        });
});


router.delete('/del/:id', function (req, res) {
    const set_pos_id = req.params.id;
    const where = `set_pos_id=${set_pos_id}`;
    db.deleteData('tbl_setporduct', where, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});


//===========================
router.post("/editimg/:id", function (req, res) {
    const productId = req.params.id;
    let myFileName = '';

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './assets/pos');
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            myFileName = `${productId}${ext}`;
            cb(null, myFileName);
        }
    });
    const upload = multer({ storage }).single('imgPos');
    const wheres = `product_id='${productId}'`;
    db.selectWhere('tbl_porducts', 'imgPos', wheres, (err, resImg) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error' });
        }
        if (resImg.length > 0 && resImg[0].imgPos && resImg[0].imgPos !== '') {
            const filePath = path.join('assets/pos', resImg[0].imgPos);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting the existing file:', err);
                }
            });
        }
        upload(req, res, function (err) {
            if (err) {
                return res.status(500).json({ error: 'File upload error' });
            }
            const table = 'tbl_porducts';
            const field = 'imgPos';
            const newData = [myFileName, productId];
            const condition = 'product_id=?';
            db.updateData(table, field, newData, condition, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update data. Please try again.' });
                }
                res.status(200).json({ message: `Data updated successfully - ${productId}` });
            });
        });
    });
});


router.post("/offOn", function (req, res) {
    const { productId, statusUse } = req.body;
    const field = `statusUse`;
    const newData = [statusUse, productId];
    const condition = `product_id=?`;
    db.updateData('tbl_porducts', field, newData, condition, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
        }
        res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
    });
})

router.delete("/:id", function (req, res, next) {
    const product_id = req.params.id;
    const condition = `product_id_fk='${product_id}'`;
    db.selectWhere('tbl_porduct_stock', '*', condition, (err, results) => {
        if (err) {
            return res.status(500).json({ status: 500, error: 'An error occurred while checking data.' });
        }
        if (!results || results.length > 0) {
            return res.status(500).json({ status: 400, error: 'ຂໍອະໄພບໍ່ສາມາດລືບຂໍ້ມູນນີ້ໄດ້' });
        } else {
            const where = `product_id='${product_id}'`;
            db.deleteData('tbl_porducts', where, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ' });
                }
                res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
            });
        }
    });
});


router.post("/", function (req, res) {
    const { shopId_fk, categories_id_fk, units_id_fk, brands_id_fk } = req.body;
    let categoriesId_fk = '';
    if (categories_id_fk && categories_id_fk !== '') {
        categoriesId_fk = `AND categories_id_fk='${categories_id_fk}'`;
    }
    let brandsId_fk = '';
    if (brands_id_fk && brands_id_fk !== '') {
        brandsId_fk = `AND brands_id_fk='${brands_id_fk}'`;
    }
    let unitsId_fk = '';
    if (units_id_fk && units_id_fk !== '') {
        unitsId_fk = `AND units_id_fk='${units_id_fk}'`;
    }
    const tables = `tbl_porducts
      left join tbl_brands ON tbl_porducts.brands_id_fk=tbl_brands.brand_id
      left join tbl_categories ON tbl_brands.categories_id_fk=tbl_categories.categories_id
      left join tbl_units ON tbl_porducts.units_id_fk=tbl_units.units_id`;
    const fields = `product_id,
            product_code,
            tbl_porducts.shop_id_fk,
            imgPos,
            product_name,
            barcode,
            brands_id_fk,
            units_id_fk,
            price_buy,
            price_sale,
            discount_sale,
            status_stock,
            qty_alert,
            statusUse,
            brand_name,
            categories_id_fk,
            categories_name,
            unit_name`;
    const where = `tbl_porducts.shop_id_fk=${shopId_fk} ${categoriesId_fk} ${brandsId_fk} ${unitsId_fk}`;
    db.selectWhere(tables, fields, where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});


router.post("/option", function (req, res) {
    const { shopId_fk, product_name } = req.body;
    let productName = '';
    if (product_name && product_name !== 'null') {
        productName = `AND (product_name LIKE '%${product_name}%' OR product_code LIKE '%${product_name}%')`;
    }
    const tables = `tbl_porducts`;
    const where = `shop_id_fk ='${shopId_fk}' ${productName} `;
    const fields = '*';
    db.selectWhere(tables, fields, where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});
//========== option sale ====================
router.post("/addOpton", function (req, res) {
    const { optionId, option_name, option_price, product_id_fk } = req.body;
    const priceSale = parseFloat(option_price.replace(/,/g, ''));
    const fieldOp = `option_id,option_name,option_price,product_id_fk`;
    if (!optionId) {
        db.autoId('tbl_option_price', 'option_id', (err, option_id) => {
            const values = [option_id, option_name, priceSale, product_id_fk];
            db.insertData('tbl_option_price', fieldOp, values, (err, results) => {
                if (err) {
                    return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                }
                res.status(200).json({ message: `ການບັນທຶກຂໍ້ມູນສ້ຳເລັດ`, id: product_id_fk });
            });
        });
    } else {
        const fieldOp = `option_name,option_price`;
        const newData = [option_name, priceSale, optionId];
        const condition = 'option_id=?';
        db.updateData('tbl_option_price', fieldOp, newData, condition, (err, results) => {
            if (err) {
                return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
            }
            res.status(200).json({ message: `ການບັນທຶກຂໍ້ມູນສ້ຳເລັດ`, id: product_id_fk });
        });
    }
});

router.get('/showpt/:id', function (req, res) {
    const product_id = req.params.id;
    const where = `product_id_fk=${product_id}`;
    db.selectWhere('tbl_option_price', '*', where, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});
router.delete('/delop/:id', function (req, res) {
    const option_id = req.params.id;
    const where = `option_id=${option_id}`;
    db.deleteData('tbl_option_price', where, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});
//===================  stock product sale ============
router.post("/addStock", async (req, res) => {
    const { branch_id_fk, productList } = req.body;
    const fields = `stock_id,branch_id_fk,product_id_fk,quantity,discount,prices,status_use`;
    try {
        const insertPromises = productList.map((product) => {
            return new Promise((resolve, reject) => {
                const stock_id = uuidv4();

                const { product_id, price_sale, discount_sale, quantity, status_use } = product;
                const whereCk = `branch_id_fk=${branch_id_fk} AND product_id_fk=${product_id}`;
                const fieldReceive = 'branch_id_fk,product_id_fk,quantity,create_date';
                db.selectWhere('tbl_porduct_stock', '*', whereCk, (err, results) => {
                    if (err) {
                        return reject(err);  // Handle selectWhere error
                    }
                    if (results || results.length <= 0) {
                        const values = [stock_id, branch_id_fk, product_id, quantity, discount_sale, price_sale, status_use];
                        db.insertData('tbl_porduct_stock', fields, values, (err, insertResults) => {
                            if (err) {
                                return reject(err);  // Handle insertData error
                            }
                            const dataReceive = [branch_id_fk, product_id, quantity, dateTime];
                            db.insertData('tbl_received', fieldReceive, dataReceive, (err, insertResults) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(insertResults);
                            })
                        });
                    } else {
                        resolve(null);  // Resolve promise if stock already exists
                    }
                });
            });
        });
        await Promise.all(insertPromises);
        res.status(200).json({ message: 'Stock added successfully' });
    } catch (error) {
        console.error('Error inserting stock:', error);
        res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສຍເລັດ` });
    }
});



router.post("/stock", function (req, res) {
    const { categoriesId_fk, brandsId_fk, unitsId_fk, branch_id_fk } = req.body;
    let categories_id_fk = '';
    if (categoriesId_fk && categoriesId_fk !== '') {
        categories_id_fk = `AND categories_id_fk='${categoriesId_fk}'`;
    }
    let brands_id_fk = '';
    if (brandsId_fk && brandsId_fk !== '') {
        brands_id_fk = `AND brands_id_fk='${brandsId_fk}'`;
    }
    let units_id_fk = '';
    if (unitsId_fk && unitsId_fk !== '') {
        units_id_fk = `AND units_id_fk='${unitsId_fk}'`;
    }

    const tables = `tbl_porduct_stock
	LEFT JOIN tbl_porducts ON  tbl_porduct_stock.product_id_fk = tbl_porducts.product_id
	LEFT JOIN tbl_units ON  tbl_porducts.units_id_fk = tbl_units.units_id
	LEFT JOIN tbl_brands ON  tbl_porducts.brands_id_fk = tbl_brands.brand_id
	LEFT JOIN tbl_categories ON  tbl_brands.categories_id_fk = tbl_categories.categories_id`;
    const fields = `tbl_porduct_stock.stock_id, 
	tbl_porduct_stock.branch_id_fk, 
	tbl_porduct_stock.product_id_fk, 
	tbl_porduct_stock.quantity, 
	tbl_porduct_stock.discount, 
	tbl_porduct_stock.prices, 
	tbl_porduct_stock.status_use, 
	tbl_porducts.product_code, 
    	CASE
        WHEN tbl_porduct_stock.image IS NULL OR tbl_porduct_stock.image  IS NULL THEN tbl_porducts.imgPos
        ELSE tbl_porduct_stock.image
    END AS ps_image,
	tbl_porducts.product_name, 
	tbl_porducts.status_stock, 
	tbl_units.unit_name, 
	tbl_brands.brand_name, 
	tbl_categories.categories_name`;
    const where = `branch_id_fk=${branch_id_fk} ${categories_id_fk} ${brands_id_fk} ${units_id_fk}`;
    db.selectWhere(tables, fields, where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

router.post('/itemsale', function (req, res) {
    const { branch_id_fk, categoriesId_fk } = req.body;

    let categories_id_fk = '';
    if (categoriesId_fk && categoriesId_fk !== null) {
        categories_id_fk = `AND categories_id_fk='${categoriesId_fk}'`;
    }

    const tables = `tbl_porduct_stock
	LEFT JOIN tbl_porducts ON tbl_porduct_stock.product_id_fk = tbl_porducts.product_id
	LEFT JOIN tbl_units ON tbl_porducts.units_id_fk = tbl_units.units_id
	LEFT JOIN tbl_brands ON tbl_porducts.brands_id_fk = tbl_brands.brand_id
	LEFT JOIN tbl_categories ON tbl_brands.categories_id_fk = tbl_categories.categories_id`;
    const fields = `tbl_porduct_stock.stock_id, 
	tbl_porduct_stock.branch_id_fk, 
	tbl_porduct_stock.product_id_fk, 
	tbl_porduct_stock.quantity, 
	tbl_porduct_stock.discount, 
	tbl_porduct_stock.prices, 
    (tbl_porduct_stock.prices-tbl_porduct_stock.discount) as price_sale,
	tbl_porduct_stock.status_use, 
	tbl_porducts.product_code, 
    	CASE
        WHEN tbl_porduct_stock.image IS NULL OR tbl_porduct_stock.image  IS NULL THEN tbl_porducts.imgPos
        ELSE tbl_porduct_stock.image
    END AS ps_image,
	tbl_porducts.product_name, 
	tbl_porducts.status_stock, 
    tbl_porducts.brands_id_fk,
	tbl_units.unit_name, 
	tbl_brands.brand_name, 
	tbl_categories.categories_name`;
    const where = `tbl_porduct_stock.status_use='1' AND branch_id_fk=${branch_id_fk} ${categories_id_fk}`;
    db.selectWhere(tables, fields, where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }

        const promises = results.map(product => {
            const whereList = `product_id_fk = '${product.product_id_fk}'`;
            return new Promise((resolve, reject) => {
                db.selectWhere('tbl_option_price', '*', whereList, (err, resultsList) => {
                    if (err) {
                        return reject(err);
                    }
                    product.priceList = resultsList;
                    resolve(product);
                });

                db.selectWhere('tbl_food_tasting', '*', whereList, (err, resultsTasting) => {
                    if (err) {
                        return reject(err);
                    }
                    product.foodTasting = resultsTasting;
                    resolve(product);
                });

            });
        });

        Promise.all(promises)
            .then(updatedResults => {
                res.status(200).json(updatedResults);
            })
            .catch(error => {
                res.status(400).send();
            });
    });
});
module.exports = router;

