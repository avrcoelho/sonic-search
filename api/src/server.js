const express = require("express");
const { v4: uuid } = require("uuid");
const { Ingest, Search } = require("sonic-channel");

const app = express();

app.use(express.json());

const sonicChannelIngest = new Ingest({
  host: "localhost",
  port: 1491,
  auth: "SecretPassword",
});

const sonicChannelSearch = new Search({
  host: "localhost",
  port: 1491,
  auth: "SecretPassword",
});

sonicChannelIngest.connect({
  connected: () => {
    console.log("connectou");
  },
});

sonicChannelSearch.connect({
  connected: () => {
    console.log("connectou");
  },
});

app.post("/pages", async (request, response) => {
  // salvar no banco de dados
  const { title, content } = request.body;
  const id = uuid();

  //cadastrar pagina no banco

  // coloca nova informação no sonichff
  // 1 - nome da "tabela" que deseja salvar no sonic
  // 2 - collection - nome que desajar
  // 3 - identificação do recurso salvo
  //4 - conteudo da pagina que vai ser buscado pelo sonic
  await sonicChannelIngest.push(
    "pages",
    "default",
    `page:${id}`,
    `${title} ${content}`,
    {
      lang: "por",
    }
  );

  return response.status(201).send();
});

app.get("/search", async (request, response) => {
  // busca dos dados
  const { q } = request.query;

  const results = await sonicChannelSearch.query("pages", "default", q, {
    lang: "por",
  });

  return response.json(results);
});

app.get("/suggest", async (request, response) => {
  // sugere termo de busca na metado do que esta buscando
  const { q } = request.query;

  const results = await sonicChannelSearch.suggest("pages", "default", q, {
    limit: 5,
  });

  return response.json(results);
});

app.listen(3333);
