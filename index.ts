
/**
 * Script: API Serverless Deno
 * 
 * Ce script déploie une petite API avec Deno qui :
 * 1. Répond aux requêtes OPTIONS (pré-flight CORS) pour autoriser les appels depuis le navigateur.
 * 2. Reçoit une requête entrante (GET/POST).
 * 3. Prépare une requête POST contenant deux mots ("centrale" et "supelec").
 * 4. Envoie cette requête à une API externe (https://word2vec.nicolasfley.fr/similarity).
 *    C’est cette API externe qui fait le calcul de similarité entre les mots.
 * 5. Récupère le résultat JSON renvoyé par cette API.
 * 6. Renvoie ce résultat au client, avec les bons en-têtes CORS pour permettre l’accès depuis le navigateur.
 *
 *   Remarque importante :
 * - La logique de calcul n’est pas ici. Ce code agit comme un “pont” entre le client et l’API de similarité.
 * - Le pré-flight CORS est indispensable pour que les navigateurs autorisent l’appel.
 */


function handlePreFlightRequest(): Response {
  return new Response("Preflight OK!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}

async function handler(_req: Request): Promise<Response> {
  if (_req.method == "OPTIONS") {
    return handlePreFlightRequest();
  }

  const url = new URL(_req.url);
  const userWord = url.searchParams.get("wordGuess");

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const similarityRequestBody = JSON.stringify({
    word1: userWord,
    word2: "supelec",
  });


  const requestOptions = {
    method: "POST",
    headers: headers,
    body: similarityRequestBody,
    redirect: "follow",
  };

  try {
    const response = await fetch("https://word2vec.nicolasfley.fr/similarity", requestOptions);   // appel à un autre API qui va faire le calcul

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return new Response(`Error: ${response.statusText}`, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type",
        },
      });
    }

    const result = await response.json();

    console.log(result);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

Deno.serve(handler);