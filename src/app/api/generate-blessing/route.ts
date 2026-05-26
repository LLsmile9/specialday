import { NextResponse } from "next/server";

const MOONSHOT_BASE_URL = "https://api.moonshot.cn/v1";
const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY || "";

export async function POST(request: Request) {
  try {
    if (!MOONSHOT_API_KEY) {
      console.error("MOONSHOT_API_KEY is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, season, person, environment, food, moodColor, timeOfDay, wish, music } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Build context from all available answers
    const contextLines = [
      season ? `- 心中的季节：${season}` : "",
      person ? `- 想要遇见的人：${person}` : "",
      environment ? `- 安放自己的地方：${environment}` : "",
      food ? `- 想要品尝的味道：${food}` : "",
      moodColor ? `- 心情的颜色：${moodColor}` : "",
      timeOfDay ? `- 此刻的时光：${timeOfDay}` : "",
      wish ? `- 心底的小心愿：${wish}` : "",
      music ? `- 耳边的旋律：${music}` : "",
    ].filter(Boolean).join("\n");

    const prompt = `你是一位温暖的、充满想象力的朋友，擅长化身为不同人物来传递生日祝福。

请根据以下信息为${name}写一段生日祝福：

- 名字：${name}
${contextLines}

【核心逻辑 - 以"Y"为灵魂】

用户提到了"${person}"，这就是祝福的灵魂人物Y。请你：

第一步：判断Y是谁
- Y是名人/作家/诗人/艺术家/历史人物？→ 找到TA最知名的角色、作品、名场面、经典台词
- Y是卡通/动漫/影视角色？→ 找到TA的经典场景、口头禅、性格特质
- Y是普通人/查不到的人？→ 跳过角色扮演，用温柔的诗意来创作

第二步：用Y的口吻送祝福
核心问题：「如果是Y送生日祝福，TA会怎么说？」
- 如果Y是孙悟空，就用他大闹天宫的豪气说"${name}，俺老孙祝你生日快活！这一岁，管他什么妖怪，一棒子打飞！"
- 如果Y是林黛玉，就用她葬花时的细腻说"${name}，今日花开逢君生辰，愿你岁岁有人惜花人"
- 如果Y是宫崎骏，就用他动画里的风和草地说"${name}，愿你像龙猫巴士上的孩子，生日这天，风会带你去看最美的风景"
- 如果Y是奥特曼，就用光和守护来说"${name}，生日快乐！无论黑暗多深，总有一道光为你而亮"
- 如果Y是周杰伦，就用他的歌词和腔调来说"${name}，祝你生辰快乐，故事的小黄花一直开"

第三步：如果Y是普通人或查不到的人
- 不强行角色扮演，而是用温暖诗意的语言，结合用户给出的季节/场景/心情等元素，创作一段有画面感的祝福

【重要规则】

1. 【必须出现名字】祝福中必须出现"${name}"，让祝福专属于TA
2. 【必须包含生日祝福】一定要有"生日"相关的祝福
3. 【用Y的经典元素】尽量引用Y最知名的作品/角色/台词/场景，让人一看就知道是TA的风格
4. 【不要说"Y对你说"】直接用Y的口吻说话，不要加"XX对你说"这类旁白

请生成以下内容，严格以JSON格式返回（不要有任何其他文字，不要用markdown代码块包裹）：

1. poeticSentenceZh：一句安静的中文诗意句子，轻柔地融合用户给出的场景元素（季节、地方、味道等）。不要堆砌，要有留白。20-35个字即可。

2. poeticSentenceEn：上面那句的英文翻译，保持安静诗意的语气。

3. birthdayBlessingZh：以Y的口吻为${name}写的生日祝福。要求：
   - 用Y最知名的角色/作品/名场面/经典台词的风格来说话
   - 【必须】出现"${name}"这个名字
   - 【必须】包含生日相关的祝福语
   - 如果Y是知名人物，一定要让人感受到TA的经典风格和标志性元素
   - 如果Y是普通人，用温暖诗意的语言创作
   - 50-90字

4. birthdayBlessingEn：上面那段祝福的英文翻译，同样保留Y的风格特征，也要包含名字${name}和生日祝福。

请只返回JSON，格式如下：
{"poeticSentenceZh":"...","poeticSentenceEn":"...","birthdayBlessingZh":"...","birthdayBlessingEn":"..."}`;

    // Call Moonshot API directly
    const response = await fetch(`${MOONSHOT_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MOONSHOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content:
              "你是一位温暖的、充满想象力的朋友，擅长化身为不同人物来传递生日祝福。当用户提到一个人物Y时，你会立刻判断Y是谁，找到Y最知名的角色、作品、经典台词和名场面，然后用Y的口吻和风格来说话，就像Y本人穿越过来送祝福一样。如果是普通人，就用温柔诗意的语言。你只返回JSON格式的数据。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Moonshot API error:", response.status, errorBody);
      return NextResponse.json(
        { error: "AI service error" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    let parsed;
    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleanedContent);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Failed to parse AI response:", content);
        return NextResponse.json(
          { error: "Failed to parse AI response" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      poeticSentence: {
        zh: parsed.poeticSentenceZh || "",
        en: parsed.poeticSentenceEn || "",
      },
      birthdayBlessing: {
        zh: parsed.birthdayBlessingZh || "",
        en: parsed.birthdayBlessingEn || "",
      },
    });
  } catch (error) {
    console.error("Error generating blessing:", error);
    return NextResponse.json(
      { error: "Failed to generate blessing" },
      { status: 500 }
    );
  }
}
