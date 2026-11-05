import defaults from "../../_data/site.json" with { type: "json" };
import { validateSiteData } from "./site-schema.ts";
export type { SiteData } from "./site-schema.ts";
export const siteData = validateSiteData(defaults);
