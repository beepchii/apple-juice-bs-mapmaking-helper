import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/feedback", upload.single("map"), async (req, res) => {
  const mode = req.body.mode;

  const prompt = `
You are a professional Brawl Stars esports map designer.
Give COMPETITIVE LADDER feedback for this ${mode} map.

Analyze:
- Balance
- Lane control
- Spawn safety
- Bush usage
- Wall placement
- Thrower strength
- Tank paths
- Sniper sightlines
- Mid control
- Flanking routes

Then give clear IMPROVEMENTS.
`;

  try {
    const image = fs.readFileSync(req.file.path, { encoding: "base64" });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:image/png;base64,${image}` } }
        ]
      }]
    });

    res.json({ feedback: response.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: "AI failed" });
  }
});

app.listen(3000, () => console.log("Apple Juice running"));
