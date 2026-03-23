import express from 'express';
import cors from 'cors';
import client from 'prom-client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

import auths from './routes/auths.js';
import conceptArts from './routes/concept-arts.js';
import artMedia from './routes/art-media.js';
import likes from './routes/likes.js';
import comments from './routes/comments.js';
import conversation from './routes/conversations.js';
import messages from './routes/messages.js';
import jobPostings from './routes/job-postings.js';
import jobApplications from './routes/job-applications.js';
import devlog from './routes/devlog.js';
import devlogMedia from './routes/devlog-media.js';
import forum from './routes/forum.js';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
  });
  next();
});

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});


const allowedOrigins = [
  /\.localhost$/,                 
  /^http:\/\/localhost(:\d+)?$/   
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((rule) =>
        rule instanceof RegExp ? rule.test(origin) : rule === origin
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log("CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition"], 
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use("/api", auths);
app.use("/api/concept-arts", conceptArts);
app.use("/api/art-media", artMedia);
app.use("/api/likes", likes);
app.use("/api/comments", comments);
app.use("/api/conversations", conversation);
app.use("/api/messages", messages);
app.use("/api/job-postings", jobPostings);
app.use("/api/job-applications", jobApplications);
app.use("/api/devlog", devlog);
app.use("/api/devlog-media", devlogMedia);
app.use("/api/forum", forum);

export default app;