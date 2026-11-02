import { Router } from "express";

import {
  registerAffiliate,
  getAllAffiliates,
} from "../controllers/affiliate.controller";

const router = Router();

router.post("/register", registerAffiliate);

router.get("/admin/all", getAllAffiliates);

export default router;