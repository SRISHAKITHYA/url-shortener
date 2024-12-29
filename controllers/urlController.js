const db = require("../config/db");
const redisClient = require("../config/redis");
const { v4: uuidv4 } = require("uuid");

exports.shortenUrl = async (req, res) => {
  const { longUrl, customAlias, topic } = req.body;
  const userId = req.user.id;
  try {
    const alias = customAlias || uuidv4().slice(0, 8);
    const shortUrl = `${process.env.BASE_URL}/${alias}`;

    await db.query(
      "INSERT INTO urls (user_id, long_url, alias, short_url, topic) VALUES ($1, $2, $3, $4, $5)",
      [userId, longUrl, alias, shortUrl, topic]
    );

    await redisClient.set(alias, longUrl);

    res.status(201).json({ shortUrl, createdAt: new Date() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to shorten URL" });
  }
};

exports.redirectUrl = async (req, res) => {
  const { alias } = req.params;
  try {
    let longUrl = await redisClient.get(alias);

    if (!longUrl) {
      const result = await db.query(
        "SELECT long_url FROM urls WHERE alias = $1",
        [alias]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "URL not found" });
      }
      longUrl = result.rows[0].long_url;
      await redisClient.set(alias, longUrl);
    }

    res.redirect(longUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to redirect" });
  }
};

exports.getUrlAnalytics = async (req, res) => {
  const { alias } = req.params;
  try {
    const url = await db.query("SELECT id FROM urls WHERE alias = $1", [alias]);
    if (url.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }
    const urlId = url.rows[0].id;

    const totalClicks = await db.query(
      "SELECT COUNT(*) as total_clicks FROM url_logs WHERE url_id = $1",
      [urlId]
    );
    const uniqueUsers = await db.query(
      "SELECT COUNT(DISTINCT ip_address) as unique_users FROM url_logs WHERE url_id = $1",
      [urlId]
    );

    const clicksByDate = await db.query(
      `SELECT DATE(timestamp) as date, COUNT(*) as clicks 
             FROM url_logs WHERE url_id = $1 
             GROUP BY DATE(timestamp) ORDER BY DATE(timestamp) DESC LIMIT 7`,
      [urlId]
    );

    const osType = await db.query(
      `SELECT os_name, COUNT(*) as unique_clicks, COUNT(DISTINCT ip_address) as unique_users 
             FROM url_logs WHERE url_id = $1 GROUP BY os_name`,
      [urlId]
    );

    const deviceType = await db.query(
      `SELECT device_name, COUNT(*) as unique_clicks, COUNT(DISTINCT ip_address) as unique_users 
             FROM url_logs WHERE url_id = $1 GROUP BY device_name`,
      [urlId]
    );

    res.json({
      totalClicks: totalClicks.rows[0].total_clicks,
      uniqueUsers: uniqueUsers.rows[0].unique_users,
      clicksByDate: clicksByDate.rows,
      osType: osType.rows,
      deviceType: deviceType.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
