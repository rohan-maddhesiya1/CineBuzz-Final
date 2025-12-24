// server/controllers/chatController.js
import axios from "axios";
import Movie from "../models/Movie.js";

export const chatHandler = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "messages[] array is required",
      });
    }

    // 1️⃣ Fetch movies from DB
    const movies = await Movie.find().lean();

    // 2️⃣ If DB is empty — avoid AI confusion
    const movieList = movies.length > 0
      ? movies.map(m => ({
          title: m.title,
          genre: m.genre,
          language: m.language,
          description: m.description,
          releaseYear: m.releaseYear,
        }))
      : [{ title: "No movies found", genre: "", description: "" }];

    // 3️⃣ AI Payload
    const payload = {
      model: "openai/gpt-4o-mini", // recommended stable model
      messages: [
        {
          role: "system",
          content: `
You are Cinebuzz AI — a friendly assistant for the Cinebuzz website.
You ONLY talk about movies, shows, genres, recommendations, and Cinebuzz features.

Here is the COMPLETE Cinebuzz movie list (title/genre/description):
${JSON.stringify(movieList)}

🔥 CRITICAL MOVIE RULES:
- Recommend ONLY movies from the list above.
- If the user asks for "movies like X", pick the closest matches from this list only.
- If the user asks by mood (funny, sad, emotional, thrilling), choose movies from this list.
- If the requested movie is not in this list, say:
  "That movie isn't available on Cinebuzz, but here are similar ones we do have!"
- NEVER recommend anything outside Cinebuzz DB.

⛔ FORBIDDEN:
- Coding help
- Math problems
- Personal advice
- Anything unrelated to movies or Cinebuzz

STYLE:
- Casual & friendly
- Short replies (2–4 lines max)
- Use emojis sometimes
- No long paragraphs
- No tables
        `
        },
        ...messages
      ],
      reasoning: { enabled: true }
    };

    // 4️⃣ Send to OpenRouter
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHATBOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.choices[0].message;

    return res.json({
      success: true,
      reply: result.content,
      reasoning_details: result.reasoning_details || null,
    });

  } catch (err) {
    console.error("Chatbot Error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Chatbot error occurred",
    });
  }
};