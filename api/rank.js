import noblox from "noblox.js";

const GROUP_ID = 34628849;
let loggedIn = false;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, rank } = req.body;
  if (!username || !rank) return res.status(400).json({ error: "Missing username or rank" });

  try {
    if (!loggedIn) {
      await noblox.setCookie(process.env.ROBLOX_COOKIE);
      loggedIn = true;
    }

    const userId = await noblox.getIdFromUsername(username);
    const roles = await noblox.getRoles(GROUP_ID);
    const role = roles.find(r => r.name.toLowerCase() === rank.toLowerCase());
    if (!role) return res.status(404).json({ error: "Rank not found" });

    const result = await noblox.setRank(GROUP_ID, userId, role.rank);
    return res.json({ success: true, username, newRank: result.name, rankId: role.rank });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
