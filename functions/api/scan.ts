// @ts-nocheck
export const onRequestPost: PagesFunction<{ GEMINI_API_KEY?: string }> = async (context) => {
  try {
    const requestData = await context.request.json() as { imageBase64: string; mimeType?: string };
    const { imageBase64, mimeType } = requestData;
    
    // Cloudflare Pages stores variables in context.env
    const apiKey = context.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured in Cloudflare environment" }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Direct Gemini API call is lightweight, fast and compatible with V8 Workers edge runtime
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Tolong analisis gambar ini. Jika ini adalah situs bersejarah, candi, atau landmark, berikan detailnya. Secara spesifik identifikasi apakah ini Candi Jago atau bukan, lalu berikan sejarah singkat atau fakta menarik tentangnya." },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Gemini API error: ${errorText}` }), {
        status: response.status,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const data = await response.json() as any;
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada hasil analisis yang ditemukan.";

    return new Response(JSON.stringify({ result: resultText }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Failed to scan image: " + error.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
