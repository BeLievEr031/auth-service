import express, { Response, NextFunction, RequestHandler } from "express";
import TenantController from "../controller/TenantController";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import TenantService from "../services/TenantService";
import { TenantRequest } from "../types";
import authenticate from "../middleware/authenticate";
import { Role } from "../constant";
import { canAccess } from "../middleware/canAccess";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Role.ADMIN]),
    (req: TenantRequest, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next)
);

export default router;
