import db from "../index.js";

export const createShop = async (shop, scope) => {
  return await db("shops")
    .insert({
      myshopify_domain: shop,
      scope,
      installed: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .onConflict("myshopify_domain")
    .merge(["myshopify_domain", "scope", "installed", "updated_at"]);
};

export const getShopByDomain = async (shop) => {
  return await db("shops").where("myshopify_domain", shop);
};

export const updateShopByDomain = async (shop, data) => {
  return await db("shops")
    .where("myshopify_domain", shop)
    .update({
      ...data,
    });
};

export const deleteShopByDomain = async (shop) => {
  return await db("shops").where("myshopify_domain", shop).del();
};
