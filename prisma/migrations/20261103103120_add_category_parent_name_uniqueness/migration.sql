CREATE UNIQUE INDEX "Category_root_name_ci_key"
ON "Category" (LOWER("name"))
WHERE "parentId" IS NULL;

CREATE UNIQUE INDEX "Category_parent_name_ci_key"
ON "Category" ("parentId", LOWER("name"))
WHERE "parentId" IS NOT NULL;
