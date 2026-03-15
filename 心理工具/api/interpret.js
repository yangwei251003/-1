const ALLOWED_ORIGINS = "*";

function parseJsonSafe(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch (innerError) {
        return null;
      }
    }
    return null;
  }
}

function normalizeResult(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const decode = parsed.decode || parsed.interpretation || "";
  const anxiety = parsed.anxiety || parsed.stressor || "";
  let plan = parsed.plan || parsed.study_plan || [];
  if (typeof plan === "string") {
    plan = plan
      .split(/\n|；|;|、|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(plan)) {
    plan = [];
  }
  const quote = parsed.quote || "";
  return {
    decode,
    anxiety,
    plan,
    quote
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "仅支持 POST 请求" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    body = parseJsonSafe(body) || {};
  }

  const dream = (body && body.dream ? String(body.dream) : "").trim();
  if (!dream) {
    res.status(400).json({ error: "缺少梦境内容" });
    return;
  }

  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "未配置 ZHIPU_API_KEY" });
    return;
  }

  const systemPrompt = `你是“企鹅教授”，面向中国电气工程本科生。请基于弗洛伊德梦的解析（位移、凝缩、象征）解读梦境，并映射到 EE 学习压力源，最后给出可执行的学习路径。\n输出必须是严格 JSON，字段如下：\n{\n  "decode": "潜在内容解读，100-160字",\n  "anxiety": "焦虑来源分析，60-120字",\n  "plan": ["学习步骤1", "学习步骤2", "学习步骤3"],\n  "quote": "一句鼓励式的话，企鹅教授口吻"\n}\n不要输出多余文字或 Markdown。`;

  const payload = {
    model: "glm-4.7",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `我的梦境是：${dream}` }
    ],
    temperature: 0.7,
    max_tokens: 1200
  };

  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: "智谱接口调用失败", detail: data });
      return;
    }

    const content = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : "";

    const parsed = normalizeResult(parseJsonSafe(content));
    if (!parsed) {
      res.status(200).json({
        decode: content || "解析失败，请重试",
        anxiety: "",
        plan: [],
        quote: "企鹅教授：我们先从整理梦境细节开始。"
      });
      return;
    }

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: "服务异常", detail: String(error) });
  }
}
