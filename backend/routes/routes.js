import { Router } from "express";
import { register, login, addProduct, getAllProduct, editProduct, deleteProduct, 
    getSingleProduct, getAllProductData
} from "../controllers/seller.controller.js"; 
import { upload } from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/verifyToken.js";




const router = Router();

//Seller Routes
router.post("/register", register)
router.post("/login", login)
router.post("/addProduct", upload.single("image"), verifyToken,  addProduct)
router.get("/getAllProduct", verifyToken, getAllProduct)
router.put("/editProduct/:id", upload.single("image"), verifyToken, editProduct)
router.delete("/deleteProduct", verifyToken, deleteProduct)
router.get("/getSingleProduct/:id", verifyToken, getSingleProduct)
router.get("/getAllProductData", verifyToken, getAllProductData)





//Admin Routes












export default router;
