import { Shopify } from "@shopify/shopify-api";
import { getCurrentSessionById } from "../session/helpers.js";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export default function verifyRequest(app, { returnHeader = true } = {}) {
  return async (req, res, next) => {
    const sessionId = Shopify.Auth.getCurrentSessionId(
      req,
      res,
      app.get("use-online-tokens")
    );
    const session = await getCurrentSessionById(sessionId);
    const isActive = Shopify.Context.SCOPES.equals(session[0].scope);
    let shop = req.query.shop;

    if (session[0] && shop && session[0].shop !== shop) {
      // The current request is for a different shop. Redirect gracefully.
      return res.redirect(`/auth?shop=${shop}`);
    }

    if (isActive) {
      try {
        // make a request to make sure oauth has succeeded, retry otherwise
        const client = new Shopify.Clients.Graphql(
          session[0].shop,
          session[0].accessToken
        );
        await client.query({ data: TEST_GRAPHQL_QUERY });
        return next();
      } catch (e) {
        if (
          e instanceof Shopify.Errors.HttpResponseError &&
          e.response.code === 401
        ) {
          // We only want to catch 401s here, anything else should bubble up
        } else {
          throw e;
        }
      }
    }

    if (returnHeader) {
      if (!shop) {
        if (session) {
          shop = session.shop;
        } else if (Shopify.Context.IS_EMBEDDED_APP) {
          const authHeader = req.headers.authorization;
          const matches = authHeader?.match(/Bearer (.*)/);
          if (matches) {
            const payload = Shopify.Utils.decodeSessionToken(matches[1]);
            shop = payload.dest.replace("https://", "");
          }
        }
      }

      if (!shop || shop === "") {
        return res
          .status(400)
          .send(
            `Could not find a shop to authenticate with. Make sure you are making your XHR request with App Bridge's authenticatedFetch method.`
          );
      }

      res.status(403);
      res.header("X-Shopify-API-Request-Failure-Reauthorize", "1");
      res.header(
        "X-Shopify-API-Request-Failure-Reauthorize-Url",
        `/auth?shop=${shop}`
      );
      res.end();
    } else {
      res.redirect(`/auth?shop=${shop}`);
    }
  };
}
