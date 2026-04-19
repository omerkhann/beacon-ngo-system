import { Router, type IRouter } from "express";
import healthRouter from "./health";
import campaignsRouter from "./campaigns";
import donationsRouter from "./donations";
import expensesRouter from "./expenses";
import volunteersRouter from "./volunteers";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(campaignsRouter);
router.use(donationsRouter);
router.use(expensesRouter);
router.use(volunteersRouter);
router.use(reportsRouter);

export default router;
