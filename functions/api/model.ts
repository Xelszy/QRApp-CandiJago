// @ts-nocheck
export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  
  if (url.searchParams.has("ping")) {
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  const defaultUrl = "https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/candijago1.glb";
  const targetUrl = url.searchParams.get("url") || defaultUrl;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Accept": "*/*"
      }
    });

    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": "model/gltf-binary",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400"
      }
    });

    return newResponse;
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Failed to load model: " + error.message }), {
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
