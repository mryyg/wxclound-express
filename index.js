const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  try {
    const streamData = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer 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",
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: "openchat/openchat-7b:free",
          messages,
          stream: true,
        }),
      }
    ).then(async (res) => {
      return res.ok ? res.body : null;
    });
    // console.log(streamData);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST",
    });

    await (async () => {
      for await (const value of streamData) {
        res.write(value);
      }
    })();
    res.end();
    // res.send({
    //   code: 200,
    //   data: 11,
    // });
  } catch (error) {
    console.log(error);
  }
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
