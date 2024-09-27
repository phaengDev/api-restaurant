const express = require('express')
const app = express()
const cors = require("cors");
const bodyParser = require('body-parser');
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const path = require("path")
app.use("/image", express.static(path.join(__dirname, "./assets/")))
const useCategories=require('./api/setting/api-categories');
const useBrand=require('./api/setting/api-brand');
const useProvice=require('./api/setting/api-province')
const useDistrict=require('./api/setting/api-district')
const useBrannch=require('./api/setting/api-branch');
const useSupplier=require('./api/setting/api-supplier');
const useStaff=require('./api/data/api-staff');
const useDepart=require('./api/setting/api-depart');
const useRights=require('./api/setting/api-rights');
const useUnits=require('./api/setting/api-unite');
const useShift=require('./api/setting/api-shift-sale');
const useTables=require('./api/setting/api-tables');
const usePorduct=require('./api/data/api-products');
const useActionPs=require('./api/data/action-product');
const useRecived=require('./api/data/api-received')
const useLogin=require('./api/checklogin');
const useTasting=require('./api/data/api-food-tasting');
const useCartOrder=require('./api/data/action_order_cart');
const useCurrency=require('./api/setting/api-currency');
//===================== use router
app.use('/cates',useCategories);
app.use('/brand',useBrand);
app.use('/unite',useUnits);
app.use('/province',useProvice);
app.use('/district',useDistrict);
app.use('/branch',useBrannch);
app.use('/supplier',useSupplier);
app.use('/staff',useStaff);
app.use('/depart',useDepart);
app.use('/rights',useRights);
app.use('/shift',useShift);
app.use('/table',useTables);
app.use('/porduct',usePorduct);
app.use('/recived',useRecived);
app.use('/actionps',useActionPs);
app.use('/tasting',useTasting);
app.use('/cart',useCartOrder);
app.use('/currency',useCurrency);
app.use('/login',useLogin)

const PORT = process.env.PORT || 3040;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});