import express from "express"
import { authorizeRoles, isAuthenticated } from "../middlewares/protect.js"
import { allOrders, deleteOrder, getOrderDetails, getSales, myOrders, newOrder, updateOrder } from "../controllers/orderControllers.js"
const router = express.Router()

router.route("/orders/new").post(isAuthenticated, newOrder)
router.route("/me/orders").get(isAuthenticated, myOrders)
router.route("/orders/:id").get(isAuthenticated, getOrderDetails)

router.route("/admin/orders").get(isAuthenticated, authorizeRoles("admin"), allOrders)
router.route("/admin/orders/:id").put(isAuthenticated, authorizeRoles("admin"), updateOrder)
router.route("/admin/orders/:id").delete(isAuthenticated, authorizeRoles("admin"), deleteOrder)
router.route("/admin/get_sales").get(isAuthenticated, authorizeRoles("admin"), getSales)
export default router