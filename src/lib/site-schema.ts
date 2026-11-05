export type SiteImage = {
  image?: string;
  alt?: string;
  width?: number;
  height?: number;
};
export type Certification = SiteImage & {
  name: string;
  completed: string;
  expires: string;
};
export type Award = SiteImage & {
  title: string;
  role: string;
  date: string;
  body: string;
};
export type ContactLink = {
  name: string;
  label: string;
  href: string;
  icon: "mail" | "code" | "profile" | "box";
};
export type SiteData = {
  name: string;
  owner: string;
  homeSubtitle: string;
  directorySubtitle: string;
  about: {
    title: string;
    subtitle: string;
    body: string;
    certifications: Certification[];
    awards: Award[];
  };
  contact: {
    title: string;
    subtitle: string;
    note: string;
    links: ContactLink[];
  };
  pond: {
    quackVolume: number;
    quackIntervalMin: number;
    quackIntervalMax: number;
  };
};

export function validateSiteData(input: unknown): SiteData {
  const value = input as SiteData;
  const fail = (field: string, message: string): never => {
    throw new Error(`_data/site.json: ${field} ${message}`);
  };
  const text = (v: unknown, field: string, max = 2000, empty = false) => {
    if (typeof v !== "string" || (!empty && !v.trim()) || v.length > max)
      fail(
        field,
        `must be ${empty ? "text" : "non-empty text"} up to ${max} characters`,
      );
  };
  const image = (v: unknown, field: string) => {
    if (!v) return;
    text(v, field, 1000);
    if (
      typeof v !== "string" ||
      !/^(?:\/assets\/|\/attachments\/|Attachments\/|https:\/\/)/.test(v) ||
      v.split(/[\\/]/).includes("..") ||
      !/\.(png|jpe?g|webp|gif)(?:\?.*)?$/i.test(v)
    )
      fail(field, "must reference a PNG, JPEG, WebP or GIF image");
  };
  if (!value || typeof value !== "object")
    fail("document", "must be an object");
  for (const key of [
    "name",
    "owner",
    "homeSubtitle",
    "directorySubtitle",
  ] as const)
    text(value[key], key, 120);
  if (!value.about || !value.contact || !value.pond)
    fail("document", "needs about, contact and pond sections");
  text(value.about.title, "about.title", 160);
  text(value.about.subtitle, "about.subtitle", 500);
  text(value.about.body, "about.body", 40000);
  for (const key of ["certifications", "awards"] as const) {
    const rows = value.about[key];
    if (!Array.isArray(rows) || rows.length > 100)
      fail(`about.${key}`, "must be a list of at most 100 entries");
    rows.forEach((row, i) => {
      const fields =
        key === "awards"
          ? ["title", "role", "date", "body"]
          : ["name", "completed", "expires"];
      for (const field of fields)
        text(
          (row as any)[field],
          `about.${key}.${i}.${field}`,
          2000,
          field === "expires",
        );
      image(row.image, `about.${key}.${i}.image`);
      if (row.image) text(row.alt, `about.${key}.${i}.alt`, 500);
      for (const field of ["width", "height"] as const)
        if (
          row[field] !== undefined &&
          (!Number.isInteger(row[field]) ||
            row[field]! < 1 ||
            row[field]! > 20000)
        )
          fail(
            `about.${key}.${i}.${field}`,
            "must be a positive image dimension",
          );
    });
  }
  for (const key of ["title", "subtitle", "note"] as const)
    text(value.contact[key], `contact.${key}`, 2000);
  if (!Array.isArray(value.contact.links) || value.contact.links.length > 30)
    fail("contact.links", "must be a list of at most 30 links");
  value.contact.links.forEach((row, i) => {
    for (const key of ["name", "label", "href"] as const)
      text(row[key], `contact.links.${i}.${key}`, 1000);
    if (!/^(https:\/\/|mailto:)/.test(row.href) || /[\r\n]/.test(row.href))
      fail(`contact.links.${i}.href`, "must start with https:// or mailto:");
    if (!["mail", "code", "profile", "box"].includes(row.icon))
      fail(`contact.links.${i}.icon`, "must be mail, code, profile or box");
  });
  const p = value.pond;
  if (!Number.isFinite(p.quackVolume) || p.quackVolume < 0 || p.quackVolume > 1)
    fail("pond.quackVolume", "must be between 0 and 1");
  if (
    !Number.isInteger(p.quackIntervalMin) ||
    p.quackIntervalMin < 10 ||
    p.quackIntervalMin > 600
  )
    fail("pond.quackIntervalMin", "must be 10–600 seconds");
  if (
    !Number.isInteger(p.quackIntervalMax) ||
    p.quackIntervalMax < p.quackIntervalMin ||
    p.quackIntervalMax > 900
  )
    fail(
      "pond.quackIntervalMax",
      "must be between the minimum and 900 seconds",
    );
  return value;
}
