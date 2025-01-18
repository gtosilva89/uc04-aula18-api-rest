import express, { Request, Response } from "express";
import { request } from "http";

// Criando instancia do servidor
const app = express();

// A API vai suportar o recebimento e envio de JSON
app.use(express.json());
const lanches = [
  {
    id: 1,
    nome: "X-Polenta Picanha",
    tamanho: "P",
    valor: 30
  },
  {
    id: 2,
    nome: "X-Polenta Picanha",
    tamanho: "G",
    valor: 45
  },
  {
    id: 3,
    nome: "X-Bacon",
    tamanho: "G",
    valor: 30,
  }
];

const pedidos = [];

function resourceHello(req: Request, res: Response) {
  console.log(req.ip);
  res.send({ message: "Hello Word" });
}

// Chamada do tipo GET para o recurso /hello
// app.get("/hello", resourceHello);

// GET lanches
app.get("/lanches", (req: Request, res: Response) => {
res.send(lanches);
})

// POST pedidos
app.post("/pedidos", (req: Request, res: Response) => {
  // resgatar as informações da requisição
  // RECOMENDADO - utiliza apenas as informações necessárias
  const {id_cliente, quantidade, nome_cliente, endereco, telefone} = req.body;

  const pedido = {
    id: pedidos.length+1,
    status: "criado",
    id_cliente,
    quantidade,
    nome_cliente,
    endereco,
    telefone,
  };

// spread operator - você vai extratir tudo que tiver de informação - NÃO RECOMENDADO
  // const pedido = {
  //   id: pedidos.length+1,
  //   status: "criado",
  //   ...req.body,
  // };

  //adicionar um pedido a lista de pedidos
  pedidos.push(pedido)
  // retornar o pedido com o id
  res.send(pedido);
});

// GET /pedidos/id/status

// PATCH /pedidos/id -> endereço entrega

// PUT

const PORT = 3000;

// Escutar chamados no meu servidor
app.listen(PORT);
