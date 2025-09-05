import noblox from "noblox.js";

const GROUP_ID = 34628849;
let loggedIn = false;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { username, rank } = req.body;
  if (!username || !rank) {
    console.warn("⚠️ Missing username or rank in request:", req.body);
    return res.status(400).json({ error: "Missing username or rank" });
  }

  try {
    if (!loggedIn) {
      console.log("🔑 Logging into Roblox with provided cookie...");
      await noblox.setCookie(process.env.ROBLOX_COOKIE);
      loggedIn = true;
      console.log("✅ Successfully logged into Roblox once (cookie set).");
    }

    console.log(`👤 Processing rank request → Username: "${username}", Target Rank: "${rank}"`);

    const userId = await noblox.getIdFromUsername(username);
    console.log(`✅ Found userId: ${userId} for username: "${username}"`);

    const roles = await noblox.getRoles(GROUP_ID);
    const role = roles.find(r => r.name.toLowerCase() === rank.toLowerCase());

    if (!role) {
      console.error(`❌ Rank "${rank}" not found in group ${GROUP_ID}`);
      return res.status(404).json({ error: `Rank "${rank}" not found` });
    }

    console.log(`📈 Setting ${username} (userId: ${userId}) to rank "${role.name}" (RankId: ${role.rank})...`);

    const result = await noblox.setRank(GROUP_ID, userId, role.rank);

    console.log(`✅ Successfully ranked ${username} → "${result.name}" (RankId: ${role.rank})`);

    return res.json({
      success: true,
      username,
      userId,
      newRank: result.name,
      rankId: role.rank,
    });
  } catch (err) {
    console.error("❌ Error while ranking:", err);
    return res.status(500).json({ error: err.message });
  }
}
