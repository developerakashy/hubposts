const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const serveStatic = require("serve-static");
const { readFileSync } = require("fs");
const { setupFdk } = require("@gofynd/fdk-extension-javascript/express");
const {
  SQLiteStorage,
} = require("@gofynd/fdk-extension-javascript/express/storage");
const sqliteInstance = new sqlite3.Database("session_storage.db");
const productRouter = express.Router();
const twitterRoute = require("./routes/twitter.routes");
const generateProductPost = require("./utils/generateProductPost");
const { redisClient, redisSubClient } = require("./redis/redis");
const Company = require("./models/company.models");
const postRoute = require("./routes/post.routes");
const { postQueue } = require("./redis/bullMQ");

const testRedis = async () => {
  try {
    await redisClient.set("check", "ok", { EX: 10 });
    await redisClient.set("check2", "ok", { EX: 10 });
    await redisClient.set("check3", "ok", { EX: 10 });
    await redisClient.set("check4", "ok", { EX: 10 });
  } catch (error) {
    console.log("redis set error: ", error);
  }
};

testRedis();

redisSubClient.pSubscribe("__keyevent@0__:expired", (key) => {
  if (key) console.log(key);
});

async function schedulePost() {
  const delay = 5000;
  await postQueue.add("twitter", { postId: "hello" }, { delay });
}
// schedulePost()
console.log(JSON.stringify(process.env));

const fdkExtension = setupFdk({
  api_key: process.env.EXTENSION_API_KEY,
  api_secret: process.env.EXTENSION_API_SECRET,
  base_url: process.env.EXTENSION_BASE_URL,
  cluster: process.env.FP_API_DOMAIN,
  callbacks: {
    auth: async (req) => {
      // Write you code here to return initial launch url after auth process complete
      const exist = await Company.findOne({
        company_id: req.query["company_id"],
      });

      if (!exist) {
        await Company.create({
          company_id: req.query["company_id"],
          client_id: req.query["client_id"],
        });
      }

      if (req.query.application_id)
        return `${req.extension.base_url}/company/${req.query["company_id"]}/application/${req.query.application_id}`;
      else
        return `${req.extension.base_url}/company/${req.query["company_id"]}`;
    },

    uninstall: async (req) => {
      // Write your code here to cleanup data related to extension
      // If task is time taking then process it async on other process.
    },
  },
  storage: new SQLiteStorage(
    sqliteInstance,
    "exapmple-fynd-platform-extension"
  ), // add your prefix
  access_mode: "online",
  webhook_config: {
    api_path: "/api/webhook-events",
    notification_email: "useremail@example.com",
    event_map: {
      "company/product/delete": {
        handler: (eventName) => {
          console.log(eventName);
        },
        version: "1",
      },
      "company/product/create": {
        handler: (eventName, info) => {
          generateProductPost(eventName, info.payload.product);
        },
        version: "2",
      },
    },
  },
});

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "frontend", "public", "dist")
    : path.join(process.cwd(), "frontend");

const app = express();
const platformApiRoutes = fdkExtension.platformApiRoutes;

// Middleware to parse cookies with a secret key
app.use(cookieParser("ext.session"));

// Middleware to parse JSON bodies with a size limit of 2mb
app.use(
  bodyParser.json({
    limit: "2mb",
  })
);


app.use("/auth", twitterRoute);
app.use("/post", postRoute);
// Serve static files from the React dist directory
app.use(serveStatic(STATIC_PATH, { index: false }));

// Route to handle webhook events and process it.
app.post("/api/webhook-events", async function (req, res) {
  try {
    console.log(`Webhook Event: ${req.body.event} received`);
    await fdkExtension.webhookRegistry.processWebhook(req);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(`Error Processing ${req.body.event} Webhook`);
    return res.status(500).json({ success: false });
  }
});

productRouter.get("/", async function view(req, res, next) {
  const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
  console.log(searchParams);

  try {
    const { platformClient } = req;
    const data = await platformClient.catalog.getProducts({
      companyId: 10327,
      pageType: "number",
      q: searchParams.get("q") || "",
    });
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

productRouter.get("/:companyId/:itemId", async function view(req, res, next) {
  const { companyId, itemId } = req.params;

  try {
    const { platformClient } = req;
    const data = await platformClient.catalog.getProduct({
      companyId,
      itemId,
    });

    return res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get products list for application
productRouter.get(
  "/application/:application_id",
  async function view(req, res, next) {
    try {
      const { platformClient } = req;
      const { application_id } = req.params;
      const data = await platformClient
        .application(application_id)
        .catalog.getAppProducts();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

// FDK extension api route which has auth middleware and FDK client instance attached to it.
platformApiRoutes.use("/products", productRouter);

// If you are adding routes outside of the /api path,
// remember to also add a proxy rule for them in /frontend/vite.config.js
app.use("/api", platformApiRoutes);

// FDK extension handler and API routes (extension launch routes)
app.use("/", fdkExtension.fdkHandler);

// Serve the React app for all other routes
app.get("*", (req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(path.join(STATIC_PATH, "index.html")));
});

module.exports = app;
