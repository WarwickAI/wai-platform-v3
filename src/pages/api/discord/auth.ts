import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";
import { prisma } from "../../../server/db/client";

const auth = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });

  if (!session?.user) {
    return res.redirect("/");
  }

  const code: string = req.query.code?.toString() ?? "";

  // ignore callback if not logged in / no OAuth code
  if (!session || !code) {
    return res.redirect("/");
  }

  const params = {
    client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
  };

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  const body = await response.json();

  if (response.status == 200) {
    const accessToken = body?.access_token;
    const refreshToken = body?.refresh_token;
    const token_type = body?.token_type;

    // Now fetch the user's discord info

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: `${token_type} ${accessToken}`,
      },
    });

    const userBody = await userResponse.json();

    // Add the discord id to the database for the user

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        discordId: userBody.id,
      },
    });

    if (accessToken) {
      res.send("Login successful!");
    }
  } else {
    if (body?.error == "invalid_grant") {
      res.send("Invalid token recieved. Please try again.");
    } else {
      res.send("Discord authentication failed.");
    }
  }
};

export default auth;
