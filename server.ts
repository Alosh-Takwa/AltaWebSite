import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Error initializing Gemini client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined.");
}

// Campaign generator endpoint using Gemini 3.5 Flash
app.post("/api/generate-campaign", async (req, res) => {
  const { businessName, businessType, targetAudience, targetLocation, campaignTone } = req.body;

  if (!businessName || !businessType) {
    return res.status(400).json({ error: "Missing businessName or businessType parameters." });
  }

  if (!ai) {
    // Graceful fallback with mock creative response in case API key is missing during first setup
    return res.status(200).json({
      slogan: `التا تبدع لأجل ${businessName}`,
      conceptCore: "تم تفعيل وضع المعاينة التجريبي. يرجى تهيئة مفتاح GEMINI_API_KEY في الإعدادات للحصول على أفكار إبداعية مخصصة بالكامل بالذكاء الاصطناعي.",
      storyboard: "لوحة بصرية متحركة تظهر شعار شركتكم يندمج مع تطلعات عملائكم في دمشق وحلب.",
      billboardIdea: "لوحة طرقية مضيئة في أوتستراد المزة تظهر منتجكم بأسلوب ثلاثي الأبعاد مبهر.",
      strategy: [
        "إطلاق حملة تشويقية على منصات التواصل الاجتماعي (تيك توك وإنستغرام)",
        "التعاون مع مؤثرين محليين لإجراء تجربة حية ومباشرة للمنتج",
        "توزيع عينات مجانية بطرق إبداعية في المراكز التجارية الكبرى"
      ],
      isFallback: true
    });
  }

  try {
    const prompt = `
      Create a culturally intelligent, extremely creative, and powerful marketing campaign concept for this business:
      - Business Name: ${businessName}
      - Business Sector/Type: ${businessType}
      - Target Audience: ${targetAudience || 'الجميع (العائلات والشباب)'}
      - Target Location/City: ${targetLocation || 'سوريا عامة والوطن العربي'}
      - Campaign Tone: ${campaignTone || 'مزيج من العاطفة والاحترافية'}

      Please generate high-impact advertising agency deliverables for Alta Advertising (شركة التا للإعلان). 
      The campaign should incorporate local Syrian/Arab cultural vibes, street landmarks, or linguistic charm if appropriate.
      Return the output as a clean JSON object in Arabic matching the specified schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are the legendary Creative Director at Alta Advertising Agency (شركة التا للإعلان). You are famous for generating jaw-dropping, viral, and highly professional advertising campaigns that connect with the Syrian and Arab consumer's heart. Your suggestions are highly specific, detailed, actionable, and extremely creative (never generic). You always respond in elegant and creative Arabic.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slogan: {
              type: Type.STRING,
              description: "الشعار اللفظي الإعلاني المبتكر والرنان للحملة (Slogan) - يفضل أن يكون قوي جداً وقريب من لهجة الفئة المستهدفة"
            },
            conceptCore: {
              type: Type.STRING,
              description: "الفكرة المحورية والعمق الفني للحملة وشرح لماذا ستنجح وتحدث ضجة (Concept)"
            },
            storyboard: {
              type: Type.STRING,
              description: "سيناريو تفصيلي مشوق لإعلان فيديو قصير أو سينمائي (تصف المشاهد البصرية والموسيقى والتعليق الصوتي بدقة)"
            },
            billboardIdea: {
              type: Type.STRING,
              description: "فكرة بصرية وتصميم إبداعي للوحة طرقية ضخمة (Billboard) في شارع حيوي (مثل المزة أو الشعلان بدمشق، أو الموكامبو بحلب)"
            },
            strategy: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "الخطوات الاستراتيجية والخدع التسويقية الفريدة لإطلاق الحملة وإشراك الجمهور"
            }
          },
          required: ["slogan", "conceptCore", "storyboard", "billboardIdea", "strategy"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response received from Gemini.");
    }

    const campaignData = JSON.parse(resultText.trim());
    return res.status(200).json(campaignData);

  } catch (error: any) {
    console.error("Error generating campaign concept:", error);
    return res.status(500).json({ 
      error: "حدث خطأ أثناء توليد الفكرة الإعلانية. يرجى المحاولة مجدداً.",
      details: error.message 
    });
  }
});

// Configure Vite middleware or static files serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Alta full-stack server running on http://localhost:${PORT}`);
  });
}

setupServer();
