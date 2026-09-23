import { Router, type IRouter } from "express";
import healthRouter from "./health";
import hospitalRouter from "./hospital";
import scanRouter from "./scan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(hospitalRouter);
router.use(scanRouter);

export default router;
