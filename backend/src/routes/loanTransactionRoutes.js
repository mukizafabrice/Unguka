import express from "express";
import {
  getLoanTransactionsByLoanId,
  getAllLoanTransactionsByUserId,
} from "../controllers/loanTransactionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  getLoanTransactionsByLoanId
);
router.get("loans/:userId", getAllLoanTransactionsByUserId);
// router.get("/:id", getLoanTransactionById);
// router.put("/:id", updateLoanTransaction);
// router.delete("/:id", deleteLoanTransaction);

export default router;
