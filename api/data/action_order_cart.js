const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { el } = require('date-fns/locale');
const currentDatetime = moment();
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');
router.post("/create", function (req, res) {
    const cart_id = uuidv4();
    const { branch_id_fk, user_id_fk, table_id_fk, product_id_fk, qty_order, price_sale, discount_price, total_price, size_id_fk, option_name, order_detail, tasting_list } = req.body;
    const fields = 'order_chat_id,branch_id_fk,user_id_fk, table_id_fk,product_id_fk, qty_order,price_sale,discount_price,total_price,size_id_fk,option_name,order_detail,create_order_date';
    const data = [cart_id, branch_id_fk, user_id_fk, table_id_fk, product_id_fk, qty_order, price_sale, discount_price, total_price, size_id_fk, option_name, order_detail, dateTime];
    const wheres = `table_id_fk=${table_id_fk} AND product_id_fk=${product_id_fk} AND size_id_fk='${size_id_fk}'`;

    db.selectWhere('tbl_order_cart', '*', wheres, (err, resultsck) => {
        if (err) {
            return reject(new Error('Error in selectWhere'));  // Handle selectWhere error
        }
        if (!resultsck || resultsck.length === 0) {
            db.insertData('tbl_order_cart', fields, data, (err, result) => {
                if (err) {
                    console.error('Error inserting order data:', err);
                    return res.status(500).json({ error: 'Failed to save order data.' });
                }
                const fieldTable = `useSale=2`;
                const whereTable = `tables_id=${table_id_fk}`;
                db.updateField('tbl_tables', fieldTable, whereTable, (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to update data. Please try again.' });
                    }
                    const order_id_fk = cart_id;
                    // Insert tasting options if present
                    if (tasting_list && tasting_list.length > 0) {
                        const insertTastingPromises = tasting_list.map(tasting => {
                            const fieldList = 'order_id_fk, tasting_name, tasting_price';
                            const dataList = [order_id_fk, tasting.tasting_name, tasting.tasting_price];

                            return new Promise((resolve, reject) => {
                                db.insertData('tbl_use_tasting', fieldList, dataList, (err, results) => {
                                    if (err) {
                                        console.error('Error inserting tasting option:', err);
                                        return reject(err);
                                    }
                                    resolve(results);
                                });
                            });
                        });

                        // Wait for all tasting insertions to complete
                        Promise.all(insertTastingPromises)
                            .then(() => {
                                res.status(200).json({ message: 'Order and tasting options saved successfully.' });
                            })
                            .catch(err => {
                                res.status(500).json({ error: 'Failed to save some tasting options.' });
                            });
                    } else {
                        res.status(200).json({ message: 'Order saved successfully without tasting options.' });
                    }
                });
            })
        } else {
            const fields = `qty_order = qty_order + ${qty_order}`;
            const condition = `table_id_fk=${table_id_fk} AND product_id_fk=${product_id_fk}`;
            db.updateField('tbl_order_cart', fields, condition, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update data. Please try again.' });
                }
                res.status(200).json({ message: `Data updated successfully` });
            });
        }
    });

});

router.get('/fetchCart/:id', async (req, res) => {
    const table_id_fk = req.params.id;
    const tables = `tbl_order_cart
	LEFT JOIN tbl_porducts ON tbl_order_cart.product_id_fk = tbl_porducts.product_id
	LEFT JOIN tbl_units ON tbl_porducts.units_id_fk = tbl_units.units_id
	LEFT JOIN tbl_porduct_stock ON tbl_porducts.product_id=tbl_porduct_stock.product_id_fk`;
    const fields = `tbl_order_cart.order_chat_id, 
	tbl_order_cart.branch_id_fk, 
	tbl_order_cart.user_id_fk, 
	tbl_order_cart.table_id_fk, 
	tbl_order_cart.product_id_fk, 
	tbl_order_cart.qty_order, 
	tbl_order_cart.price_sale, 
	tbl_order_cart.discount_price, 
    tbl_order_cart.total_price,
	tbl_order_cart.option_name, 
	tbl_order_cart.order_detail, 
	tbl_order_cart.create_order_date, 
	tbl_porducts.product_code, 
	tbl_porducts.product_name, 
    unit_name,
    CASE
        WHEN tbl_porduct_stock.image IS NULL OR tbl_porduct_stock.image  IS NULL THEN tbl_porducts.imgPos
        ELSE tbl_porduct_stock.image
    END AS ps_image`;
    const wheres = `table_id_fk=${table_id_fk}`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }

        const promises = results.map(order => {
            const whereList = `order_id_fk = '${order.order_chat_id}'`;
            return new Promise((resolve, reject) => {
                db.selectWhere('tbl_use_tasting', '*', whereList, (err, resultsList) => {
                    if (err) {
                        return reject(err);
                    }
                    order.tastingUse = resultsList;
                    resolve(order);
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
        // res.status(200).json(results);
    });
})

router.get('/plus/:id', async (req, res) => {
    const cartId = req.params.id;
    const fields = `qty_order = qty_order + 1`;
    const condition = `order_chat_id='${cartId}'`;
    db.updateField('tbl_order_cart', fields, condition, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update data. Please try again.' });
        }
        res.status(200).json({ message: `Data updated successfully` });
    });
});


router.get('/minusQty/:id', async (req, res) => {
    const cartId = req.params.id;
    const fields = `qty_order = qty_order -1`;
    const condition = `order_chat_id='${cartId}'`;
    db.updateField('tbl_order_cart', fields, condition, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update data. Please try again.' });
        }
        res.status(200).json({ message: `Data updated successfully` });
    });
});

router.delete('/delete/:id/:tableId', async (req, res) => {
    const { id, tableId } = req.params;
    const condition = `order_chat_id='${id}'`;
    db.deleteData('tbl_order_cart', condition, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update data. Please try again.' });
        }
        const delUse = `order_id_fk='${id}'`;
        db.deleteData('tbl_use_tasting', delUse, (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update data. Please try again.' });
            }

            const whereCart = `table_id_fk=${tableId}`;
            db.selectWhere('tbl_order_cart', '*', whereCart, (err, results) => {
                if (results.length <= 0) {
                    const fieldTable = `useSale=1`;
                    const whereTable = `tables_id=${tableId}`;
                    db.updateField('tbl_tables', fieldTable, whereTable, (err, results) => {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to update data. Please try again.' });
                        }
                        res.status(200).json({ message: `Data updated successfully` });
                    });
                } else {
                    res.status(200).json({ message: `Data updated successfully` });
                }
            });
        });
    });
});

module.exports = router