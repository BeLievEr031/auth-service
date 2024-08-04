import { NextFunction, Response } from "express";
import TenantService from "../services/TenantService";
import { TenantRequest } from "../types";

class TenantController {
    constructor(private tenantService: TenantService) {}
    async create(req: TenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;

        try {
            const tenant = await this.tenantService.create({ name, address });
            res.status(201).json(tenant);
        } catch (error) {
            return next(error);
        }
    }
}

export default TenantController;
