import express, { Response, NextFunction } from "express";
import TenantController from "../controller/TenantController";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import TenantService from "../services/TenantService";
import { TenantRequest } from "../types";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService);

router.post("/", (req: TenantRequest, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next)
);

export default router;
