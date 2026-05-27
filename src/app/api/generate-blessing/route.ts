import { NextResponse } from "next/server";

export const runtime = 'edge';

const MOONSHOT_BASE_URL = "https://api.moonshot.cn/v1";

export async function POST(request: Request) {
  const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY || "";
  try {
    if (!MOONSHOT_API_KEY) {
      console.error("MOONSHOT_API_KEY is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, person, story } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!person) {
      return NextResponse.json({ error: "Person is required" }, { status: 400 });
    }

    const prompt = `你是一位温暖的、充满想象力的朋友，擅长化身为不同人物来传递生日祝福。

以下是${name}的一段小船漂流的故事：

${story}

小船在岸边停下，${person}想对${name}说……

【故事中的隐喻】
这段故事里的每个选择都映射着${name}的内心世界：
- 木船漂到哪里 → TA正处在什么样的人生境遇中
- 小船的状态 → TA的生活节奏和内心步调
- 天空与天气 → TA此刻的情绪和心境
- 岸边的景象 → TA内心向往的美好
- 飘来的味道 → TA对什么气息最敏感
- 船上的食物 → TA的生活品味和偏好

请从中感受TA的内心，化作祝福的底色和意象，但绝对不要直接提及故事中选项的字面内容。

【核心逻辑 - 以"Y"为灵魂】

用户提到了"${person}"，这就是祝福的灵魂人物Y。请你：

第一步：判断Y是谁
- Y是名人/作家/诗人/艺术家/历史人物？→ 找到TA最知名的作品、风格、意象和语言习惯
- Y是卡通/动漫/影视角色？→ 找到TA的经典场景、口头禅、性格特质
- Y是普通人/查不到的人？→ 跳过角色扮演，用温柔的诗意来创作

第二步：用Y的口吻送祝福
核心问题：「如果是Y送生日祝福，TA会怎么说？」
- 如果Y是孙悟空，就用他大闹天宫的豪气说"${name}，俺老孙祝你生日快活！这一岁，管他什么妖怪，一棒子打飞！"
- 如果Y是席慕容，就用她写《一棵开花的树》时的温柔说"${name}，愿你如那棵开花的树，在你最美丽的时刻，被温柔地看见。生日快乐。"
- 如果Y是宫崎骏，就用他动画里的风和草地说"${name}，愿你像龙猫巴士上的孩子，生日这天，风会带你去看最美的风景"
- 如果Y是奥特曼，就用光和守护来说"${name}，生日快乐！无论黑暗多深，总有一道光为你而亮"
- 如果Y是周杰伦，就用他的歌词和腔调来说"${name}，祝你生辰快乐，故事的小黄花一直开"
- 如果Y是诗人/作家，请用TA写诗或写文的方式说话——用TA常用的意象、句式和节奏，像一首小诗或一段散文
- 如果Y是温柔安静的人物，用轻柔细腻的语言，像微风和月光

第三步：如果Y是普通人或查不到的人
- 不强行角色扮演，而是用温暖诗意的语言，结合故事中的意象，创作一段有画面感的祝福

【重要规则】

1. 【必须出现名字】祝福中必须出现"${name}"，让祝福专属于TA
2. 【必须包含生日祝福】一定要有"生日"相关的祝福
3. 【用Y的经典元素】尽量引用Y最知名的作品/角色/台词/场景，让人一看就知道是TA的风格
4. 【不要说"Y对你说"】直接用Y的口吻说话，不要加旁白
5. 【化用而非直述】绝对不要直接提及故事中的选项内容。比如故事中说"漂到了冰川脚下"，不要说"在冰川脚下"，而要从中感受那份沉静与深远，化为"静谧"或"深流"这样的意象。把故事的选择化为感受和画面，而非标签和描述。

请生成以下内容，严格以JSON格式返回（不要有任何其他文字，不要用markdown代码块包裹）：

1. poeticSentenceZh：一句安静的中文诗意句子，轻柔地融合故事中的意象（化为感受，不要直述选项）。不要堆砌，要有留白。20-35个字即可。

2. poeticSentenceEn：上面那句的英文翻译，保持安静诗意的语气。

3. birthdayBlessingZh：以Y的口吻为${name}写的生日祝福。要求：
   - 用Y最知名的作品/角色/名场面/经典台词的风格来说话
   - 如果Y是诗人/作家，请用TA的诗意语言和独特意象
   - 【必须】出现"${name}"这个名字
   - 【必须】包含生日相关的祝福语
   - 【化用故事中的意象】把故事中的场景化为感受和画面，不要直述选项内容
   - 如果Y是知名人物，一定要让人感受到TA的经典风格和标志性元素
   - 如果Y是普通人，用温暖诗意的语言创作
   - 50-90字

4. birthdayBlessingEn：上面那段祝福的英文翻译，同样保留Y的风格特征，也要包含名字${name}和生日祝福。

请只返回JSON，格式如下：
{"poeticSentenceZh":"...","poeticSentenceEn":"...","birthdayBlessingZh":"...","birthdayBlessingEn":"..."}`;

    // Call Moonshot API
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
              "你是一位温暖的、充满想象力的朋友，擅长化身为不同人物来传递生日祝福。当用户提到一个人物Y时，你会立刻判断Y是谁，找到Y最知名的作品、风格、意象和语言习惯，然后用Y的口吻和风格来说话，就像Y本人穿越过来送祝福一样。如果Y是诗人，你要用诗的语言；如果Y是作家，你要用TA的文字节奏；如果Y是温柔安静的人，你要像微风和月光；如果Y是普通人，就用温柔诗意的语言。绝对不要直述用户的选择，而是把故事中的意象化为感受和画面。你只返回JSON格式的数据。",
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
