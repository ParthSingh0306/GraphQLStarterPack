import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import createApolloGraphqlServer from "./graphql";
import UserService from "./services/User";

async function init() {
  const app = express();
  const PORT = process.env.PORT || 8000;

  app.use(bodyParser.json());

  app.get("/", (req, res) => {
    res.json({ message: "Everything is working fine!" });
  });

  const gqlServer = await createApolloGraphqlServer();
  app.use(
    "/graphql",
    expressMiddleware(gqlServer, {
      context: async ({ req, res }) => {
        const token = req.headers["token"];
        try {
          const user = await UserService.decodeJWTToken(token as string);
          return { user };
        } catch (error) {
          return {};
        }
      },
    })
  );

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

init();