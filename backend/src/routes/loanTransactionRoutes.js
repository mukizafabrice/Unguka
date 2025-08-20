import express from "express";
import {
  getAllLoanTransactions,
  getAllLoanTransactionsByUserId,
} from "../controllers/loanTransactionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  getAllLoanTransactions
);
router.get("/:userId", getAllLoanTransactionsByUserId);
// router.get("/:id", getLoanTransactionById);
// router.put("/:id", updateLoanTransaction);
// router.delete("/:id", deleteLoanTransaction);

export default router;
