(() => {
  const dreamInput = document.querySelector("[data-role='dream-input']");
  const analyzeBtn = document.querySelector("[data-role='analyze']");
  const clearBtn = document.querySelector("[data-role='clear']");
  const chips = document.querySelectorAll("[data-role='chip']");
  const resultsSection = document.querySelector("[data-role='results']");
  const decodeEl = document.querySelector("[data-role='decode']");
  const anxietyEl = document.querySelector("[data-role='anxiety']");
  const planEl = document.querySelector("[data-role='plan']");
  const quoteEl = document.querySelector("[data-role='quote']");
  const tipEl = document.querySelector("[data-role='tip']");
  const steps = Array.from(document.querySelectorAll("[data-role='step']"));

  if (!dreamInput || !analyzeBtn || !resultsSection) {
    return;
  }

  const topicRules = [
    {
      keywords: ["plc", "梯形", "逻辑", "继电", "ladder"],
      topic: "PLC 与逻辑控制",
      anxiety: "你在被评估或现场调试情境下，担心逻辑失误导致系统失效。",
      plan: [
        "复习 PLC 扫描周期与互锁逻辑",
        "完成 3 组梯形图故障诊断案例",
        "模拟 2 次现场报警处理流程"
      ]
    },
    {
      keywords: ["运放", "模拟", "放大", "噪声", "饱和", "电路"],
      topic: "模拟电路与仪表",
      anxiety: "你担心电路稳定性不足，导致输出异常或测量误差。",
      plan: [
        "重新推导 2 个经典运放电路",
        "完成 2 次实验调试记录并总结噪声来源",
        "设计 1 个低通滤波器并进行仿真"
      ]
    },
    {
      keywords: ["电机", "转速", "失控", "电力", "负载", "传动"],
      topic: "电机与电力系统",
      anxiety: "你担心启动或负载变化导致系统失控，缺乏故障处理把握。",
      plan: [
        "梳理电机启动与保护流程",
        "列出 5 个典型故障场景并写出处理步骤",
        "完成 1 次启动过程仿真"
      ]
    },
    {
      keywords: ["fpga", "时序", "逻辑门", "verilog", "数字", "数电"],
      topic: "数字系统与 FPGA",
      anxiety: "你担心时序约束或设计错误导致综合失败。",
      plan: [
        "回顾时序分析与时钟约束",
        "完成 2 个小型模块设计并自测",
        "整理一次综合失败的复盘报告"
      ]
    },
    {
      keywords: ["信号", "频域", "滤波", "傅里叶", "dsp"],
      topic: "信号与系统",
      anxiety: "你担心频域理解不足，无法正确设计滤波器。",
      plan: [
        "完成 2 次频域分析练习",
        "手算 1 组傅里叶变换并验证",
        "进行 1 次滤波器仿真"
      ]
    },
    {
      keywords: ["单片机", "嵌入式", "mcu", "arm", "串口"],
      topic: "嵌入式与控制",
      anxiety: "你担心软硬件协同不稳定，导致调试卡住。",
      plan: [
        "梳理外设初始化流程",
        "完成 2 次调试日志分析",
        "实现 1 个稳定的采样闭环控制"
      ]
    }
  ];

  const fallbackTopic = {
    topic: "电气工程综合能力",
    anxiety: "你对整体技术稳定性存在担忧，害怕在关键场景中出错。",
    plan: [
      "复盘最近一门课程的薄弱点",
      "完成 2 次专项练习并总结错误",
      "制定一周的复习节奏与打卡计划"
    ]
  };

  const symbolRules = [
    { keywords: ["火", "燃", "爆", "烧"], hint: "火或爆炸象征对错误代价与失控后果的担忧" },
    { keywords: ["水", "淹", "溺", "下沉"], hint: "水象征情绪负荷与控制感下降" },
    { keywords: ["云", "雾", "模糊"], hint: "云雾象征思路不清或知识结构松散" },
    { keywords: ["考试", "答辩", "面试", "评审", "演示"], hint: "评估场景象征被检验的压力" },
    { keywords: ["报警", "红灯", "闪烁"], hint: "报警象征对系统异常的敏感与紧张" }
  ];

  function findTopic(text) {
    const lowered = text.toLowerCase();
    for (const rule of topicRules) {
      if (rule.keywords.some((word) => lowered.includes(word))) {
        return rule;
      }
    }
    return fallbackTopic;
  }

  function findSymbolHints(text) {
    return symbolRules
      .filter((rule) => rule.keywords.some((word) => text.includes(word)))
      .map((rule) => rule.hint);
  }

  function buildDecode(text, topic) {
    const hints = findSymbolHints(text);
    const mechanisms = ["象征"];
    if (/考试|答辩|面试|评审|演示/.test(text)) {
      mechanisms.push("位移");
    }
    if (hints.length >= 2) {
      mechanisms.push("凝缩");
    }
    const mechanismText = Array.from(new Set(mechanisms)).join("、");
    const hintText = hints.length ? `梦境符号提示：${hints.join("；")}。` : "梦境中的细节构成了象征性表达。";
    return `${hintText}这体现了${mechanismText}机制，潜在内容指向你对“${topic.topic}”稳定性的担忧与自我要求。`;
  }

  function buildQuote(topic) {
    return `企鹅教授：你的梦在提醒你关注 ${topic.topic}。把焦虑拆成小步骤，你会稳下来。`;
  }

  function resetSteps() {
    steps.forEach((step) => {
      step.classList.remove("is-active", "is-done");
    });
  }

  function runStepAnimation() {
    return new Promise((resolve) => {
      let stepIndex = 0;
      const tick = () => {
        if (stepIndex < steps.length) {
          steps.forEach((step, index) => {
            step.classList.toggle("is-active", index === stepIndex);
            step.classList.toggle("is-done", index < stepIndex);
          });
          stepIndex += 1;
          setTimeout(tick, 420);
        } else {
          steps.forEach((step) => {
            step.classList.remove("is-active");
            step.classList.add("is-done");
          });
          resolve();
        }
      };
      tick();
    });
  }

  async function fetchAnalysis(text) {
    const response = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dream: text })
    });
    if (!response.ok) {
      throw new Error("接口响应失败");
    }
    return response.json();
  }

  function normalizePlan(plan) {
    if (Array.isArray(plan)) return plan;
    if (typeof plan === "string") {
      return plan
        .split(/\n|；|;|、|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  async function runAnalysis() {
    const text = dreamInput.value.trim();
    if (!text) {
      if (tipEl) {
        tipEl.textContent = "请先输入梦境内容，我们才能开始解读。";
      }
      return;
    }

    resetSteps();
    if (tipEl) {
      tipEl.textContent = "企鹅教授正在解读，请稍候...";
    }

    const stepPromise = runStepAnimation();
    let apiResult = null;
    try {
      apiResult = await fetchAnalysis(text);
    } catch (error) {
      apiResult = null;
    }

    await stepPromise;

    let decode = "";
    let anxiety = "";
    let plan = [];
    let quote = "";

    if (apiResult && apiResult.decode) {
      decode = apiResult.decode;
      anxiety = apiResult.anxiety || "";
      plan = normalizePlan(apiResult.plan);
      quote = apiResult.quote || "企鹅教授：我们先从整理梦境细节开始。";
    } else {
      const topic = findTopic(text);
      decode = buildDecode(text, topic);
      anxiety = topic.anxiety;
      plan = topic.plan;
      quote = buildQuote(topic);
      if (tipEl) {
        tipEl.textContent = "暂未连接到 AI 服务，已使用本地规则生成结果。";
      }
    }

    if (decodeEl) decodeEl.textContent = decode;
    if (anxietyEl) anxietyEl.textContent = anxiety;
    if (planEl) {
      planEl.innerHTML = plan.map((item) => `<li>${item}</li>`).join("");
    }
    if (quoteEl) quoteEl.textContent = quote;
    resultsSection.classList.add("is-visible");
    if (tipEl && apiResult && apiResult.decode) {
      tipEl.textContent = "解读完成。你可以继续补充梦境细节以获得更准确的建议。";
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  analyzeBtn.addEventListener("click", runAnalysis);

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      dreamInput.value = "";
      resultsSection.classList.remove("is-visible");
      resetSteps();
      if (tipEl) {
        tipEl.textContent = "提示：细节越具体，解读越准确。";
      }
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const sample = chip.getAttribute("data-dream");
      if (sample) {
        dreamInput.value = sample;
        dreamInput.focus();
      }
    });
  });
})();
