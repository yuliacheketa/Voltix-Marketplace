import { Router } from "express";
import { asyncRoute } from "../../middleware/asyncRoute";
import * as catalogController from "./catalog.controller";

export const catalogRouter = Router();

catalogRouter.get("/products", asyncRoute(catalogController.getProducts));
catalogRouter.get(
  "/products/price-range",
  asyncRoute(catalogController.getProductsPriceRange)
);
catalogRouter.get(
  "/products/:slug/reviews",
  asyncRoute(catalogController.getProductReviews)
);
catalogRouter.get("/products/:slug", asyncRoute(catalogController.getProduct));
catalogRouter.get("/categories", asyncRoute(catalogController.getCategories));
catalogRouter.get(
  "/categories/:slug",
  asyncRoute(catalogController.getCategory)
);
