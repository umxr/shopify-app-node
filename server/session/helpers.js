import db from "../db/index.js";

export const getCurrentSessionById = async (sessionId) => {
  return await db.from("sessions").where("session_id", sessionId);
};
