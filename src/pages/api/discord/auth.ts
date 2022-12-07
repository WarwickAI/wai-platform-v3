import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";

const auth = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });

  const code: string = req.query.code?.toString() ?? "";

  // ignore callback if not logged in / no OAuth code
  if (!session || !code) {
    return res.redirect("/")
  }

  console.log("AUTH CODE: " + code);

  const params = {
    "client_id": env.DISCORD_CLIENT_ID,
    "client_secret": env.DISCORD_CLIENT_SECRET,
    "grant_type": "authorization_code",
    "code": code,
    "redirect_uri": "http://localhost:3000/api/discord/auth" // TODO: MAKE ENV
  };

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(params)
  });

  const body = await response.json();

  if (response.status == 200) {
    const accessToken = body?.access_token;
    const refreshToken = body?.refresh_token;

    if (accessToken) {
      res.send("Login successful!");
    }
  }
  else {
    if (body?.error == "invalid_grant") {
      res.send("Invalid token recieved. Please try again.");
    }
    else {
      res.send("Discord authentication failed.");
    }
  }
};

export default auth;
