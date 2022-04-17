import db from "../db/index.js";

class Store {
  constructor() {
    this.db = db;
  }

  async storeCallback(session) {
    try {
      const currentSession = await this.db
        .select("session_id")
        .from("sessions")
        .where("session_id", session.id);
      if (currentSession.length === 0) {
        await this.db("sessions").insert({
          session_id: session.id,
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope,
          expires: session.expiresAt,
          accessToken: session.accessToken,
          onlineAccessInfo: session.onlineAccessInfo,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        await this.db("sessions").where("session_id", session.id).update({
          session_id: session.id,
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope,
          expires: session.expiresAt,
          accessToken: session.accessToken,
          onlineAccessInfo: session.onlineAccessInfo,
          updated_at: new Date(),
        });
      }
      return true;
    } catch (error) {
      console.log("error", error);
      throw new Error(error);
    }
  }

  async loadCallback(id) {
    try {
      const currentSession = await this.db
        .from("sessions")
        .where("session_id", id);
      if (currentSession.length === 0) {
        return undefined;
      }
      return currentSession[0];
    } catch (error) {
      console.log("error", error);
      throw new Error(error);
    }
  }

  async deleteCallback(id) {
    try {
      await this.db("sessions").where("session_id", id).del();
      return true;
    } catch (error) {
      console.log("error", error);
      throw new Error(err);
    }
  }
}

export default Store;
