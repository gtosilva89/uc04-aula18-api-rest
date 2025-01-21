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
    valor: 30,
  },
  {
    id: 2,
    nome: "X-Polenta Picanha",
    tamanho: "G",
    valor: 45,
  },
  {
    id: 3,
    nome: "X-Bacon",
    tamanho: "G",
    valor: 30,
  },
];

type Pedido = {
  id: number;
  status: string;
  id_lanche: number;
  nome_lanche: string;
  quantidade: number;
  nome_cliente: string;
  endereco: string;
  telefone: string;
};

const pedidos: Pedido[] = [];

function resourceHello(req: Request, res: Response) {
  console.log(req.ip);
  res.send({ message: "Hello Word" });
}

// Chamada do tipo GET para o recurso /hello
// app.get("/hello", resourceHello);

// GET lanches
app.get("/lanches", (req: Request, res: Response) => {
  res.send(lanches);
});

// POST pedidos
app.post("/pedidos", (req: Request, res: Response) => {
  // resgatar as informações da requisição
  // RECOMENDADO - utiliza apenas as informações necessárias
  const { id_lanche, quantidade, nome_cliente, endereco, telefone } = req.body;

  // validar se o lanche com o id existe na lista de lanches

  let lanche;

  for (const l of lanches) {
    if (l.id === id_lanche) {
      lanche = l;
      break;
    }
  }

  // se não existir retorna um erro dizendo que não existe
  if (!lanche) {
    res.status(404).send("Lanche não encontrado!");
    return;
  }
  // se existir, segue a criação do pedido
  const nome_lanche = lanche.nome;

  const pedido = {
    id: pedidos.length + 1,
    status: "criado",
    id_lanche,
    nome_lanche,
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
  pedidos.push(pedido);
  // retornar o pedido com o id
  res.send(pedido);
});

// Buscar um pedido pelo seu ID
// GET /pedidos/id/status
app.get("/pedidos/:id/status", (req: Request, res: Response) => {
  // como pegar o id do pedido na requisição?
  const { id } = req.params;

  if (!id) {
    res.status(400).send("Id do pedido inválido!");
    return;
  }

  // converto o id que é string para um número inteiro
  const id_pedido = parseInt(id, 10);
  // Buscar o pedido com o id da requisição
  let pedido;
  for (const p of pedidos) {
    if (p.id === id_pedido) {
      pedido = p;
      break;
    }
  }
  // Se o pedido não existir, retorna um erro
  if (!pedido) {
    res.status(404).send({ error: "Pedido não encontrado!" });
    return;
  }
  // Se existir, retorna o pedido completo
  res.send({ status: pedido.status });
});

// Altera alguns dados do recurso
// PATCH /pedidos/id -> endereço entrega
app.patch("/pedidos/:id", (req: Request, res: Response) => {
  //Buscar e converter o id do pedido
  //Recupero o id do pedido na requisição
  const { id } = req.params;

  // converto o id que é string para um número inteiro
  const id_pedido = parseInt(id, 10);

  //Pegar a informação do endereço do corpo da requisição
  const { endereco } = req.body;
  //Buscar o pedido e caso encontre, alterar o endereço
  for (const p of pedidos) {
    if (p.id === id_pedido) {
      if (endereco && p.endereco !== endereco) {
        res.status(400).send({ error: "Endereço Inválido!" });
        return;
      }
      p.endereco = endereco;
      //Retornar o pedido completo com os dados alterados
      res.send(p);
      break;
    }
  }
});

// PUT

const PORT = 3000;

// Escutar chamados no meu servidor
app.listen(PORT);
