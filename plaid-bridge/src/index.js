/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle Preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. Create a Link Token
      if (path === "/create_link_token" && request.method === "POST") {
        const response = await fetch(`${env.PLAID_ENV_URL}/link/token/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: env.PLAID_CLIENT_ID,
            secret: env.PLAID_SECRET,
            client_name: "Svvvy Budget",
            country_codes: ["US"],
            language: "en",
            user: { client_user_id: "unique_user_id" },
            products: ["transactions"],
          }),
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: corsHeaders });
      }

      // 2. Exchange Public Token
      if (path === "/exchange_token" && request.method === "POST") {
        const { public_token } = await request.json();
        const response = await fetch(`${env.PLAID_ENV_URL}/item/public_token/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: env.PLAID_CLIENT_ID,
            secret: env.PLAID_SECRET,
            public_token: public_token,
          }),
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: corsHeaders });
      }

      // 3. Get Transactions (The data your AI will process)
      if (path === "/get_transactions" && request.method === "POST") {
        const { access_token } = await request.json();
        const response = await fetch(`${env.PLAID_ENV_URL}/transactions/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: env.PLAID_CLIENT_ID,
            secret: env.PLAID_SECRET,
            access_token: access_token,
          }),
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: corsHeaders });
      }

      return new Response("Not Found", { status: 404 });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  },
};