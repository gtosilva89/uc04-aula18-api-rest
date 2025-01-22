import express, { Request, Response } from "express";

// Criando a instancia do servidor
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

// const resourceHello = (req: Request, res: Response) => {
//   console.log(req.ip);
//   res.send({ message: "Hello World" });
// }

function resourceHello(req: Request, res: Response) {
  console.log(req.ip);
  res.send({ message: "Hello World" });
}

// Recurso GET /hello
app.get("/hello", resourceHello);

// GET /lanches
app.get("/lanches", (req: Request, res: Response) => {
  res.send(lanches);
});

// Cria um pedido novo
// POST /pedidos
app.post("/pedidos", (req: Request, res: Response) => {
  // resgatar as informações da requisição
  // RECOMENDADO, pois, você só usa o que precisa da requisição
  // É feita uma sanitização do corpo da requisição
  const { id_lanche, quantidade, nome_cliente, endereco, telefone } = req.body;

  // validar se o lanche com id existe na lista de lanches
  let lanche;

  for (const l of lanches) {
    if (l.id === id_lanche) {
      lanche = l;
      break;
    }
  }

  // Se não existir, retorna um erro dizendo que não existe
  if (!lanche) {
    res.status(404).send("Lanche não encontrado.");
    return;
  }

  // Se existir, segue a criação do pedido
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

  // NÃO RECOMENDADO - Spread Operator
  // const pedido = {
  //   id: pedidos.length + 1,
  //   status: "criado",
  //   ...req.body,
  // };

  // adicionar um pedido a lista de pedidos
  pedidos.push(pedido);
  // retornar o pedido com o id
  res.send(pedido);
});

// Buscar um pedido pelo seu ID
// GET /pedidos/id/status
app.get("/pedidos/:id/status", (req: Request, res: Response) => {
  // Recupero o id do pedido na requisição
  const { id } = req.params;

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
    res.status(404).send({ error: "Pedido não encontrado" });
    return;
  }
  // Se existir, retorna o pedido completo
  res.send({ status: pedido.status });
});

// A lista com todos os pedidos
// GET /pedidos
app.get("/pedidos", (req: Request, res: Response) => {
  // paginação de pedidos com query params
  const pagina = req.query.pagina as string;
  const status = req.query.status as string;
  let numeroPagina = 1;

  if (pagina) {
    numeroPagina = parseInt(pagina, 10);
  }
  const itensPorPagina = 5;
  const indexFinal = itensPorPagina * numeroPagina;
  const indexInicial = indexFinal - itensPorPagina;
  let paginaPedidos: Pedido[];
  if (status) {
    paginaPedidos = pedidos
      .filter((p) => p.status === status)
      .slice(indexInicial, indexFinal);
  } else {
    paginaPedidos = pedidos.slice(indexInicial, indexFinal);
  }
  res.send(paginaPedidos);
});

// Altera alguns dados do recurso
// PATCH /pedidos/id -> endereço entrega
app.patch("/pedidos/:id", (req: Request, res: Response) => {
  // Buscar e converter o id do pedido
  // Recupero o id do pedido na requisição
  const { id } = req.params;

  // converto o id que é string para um número inteiro
  const id_pedido = parseInt(id, 10);

  // Pegar a informação do endereço do corpo da requisição
  const { endereco } = req.body;

  // Buscar o pedido e caso encontre, alterar o endereço
  for (const p of pedidos) {
    if (p.id === id_pedido) {
      // Se o endereço for válido e diferente do endereço atual
      if (!endereco || p.endereco === endereco) {
        res.status(400).send({ error: "Endereço inválido." });
        return;
      }
      p.endereco = endereco;
      // Retornar o pedido completo com os dados alterados
      res.send(p);
      break;
    }
  }
});

// Eu recebo todos os dados e modifico todo o pedido
// PUT /pedidos/id -> alterar o lanche
app.put("/pedidos/:id", (req: Request, res: Response) => {
  // resgatar as informações da requisição
  // RECOMENDADO, pois, você só usa o que precisa da requisição
  const { id_lanche, quantidade, nome_cliente, endereco, telefone } = req.body;

  const id_pedido = parseInt(req.params.id, 10);

  // buscar o pedido com o id
  const indexPedido = pedidos.findIndex((pedido) => pedido.id === id_pedido);

  // valida se o pedido foi encontrado
  if (indexPedido === -1) {
    res.status(404).send({ error: "Pedido não encontrado." });
    return;
  }

  const pedido = pedidos[indexPedido];

  // se ele for encontrado, valida se o id do lanche é diferente
  if (pedido.id_lanche !== id_lanche) {
    // buscar o lanche novo
    const lanche = lanches.find((l) => l.id === id_lanche);

    // se o lanche não existir, retorna erro 400 - Id do lanche inválido
    // Clausula Guarda
    if (!lanche) {
      res
        .status(400)
        .send({ error: `Lanche com o id ${id_lanche} não foi encontrado.` });
      return;
    }

    pedido.id_lanche = id_lanche;
    pedido.nome_lanche = lanche.nome;
  }

  if (pedido.quantidade !== quantidade) {
    pedido.quantidade = quantidade;
  }

  if (pedido.nome_cliente !== nome_cliente) {
    pedido.nome_cliente = nome_cliente;
  }
  if (pedido.endereco !== endereco) {
    pedido.endereco = endereco;
  }

  if (pedido.telefone !== telefone) {
    pedido.telefone = telefone;
  }

  // se encontrar, altera todos os dados do pedido
  pedidos[indexPedido] = { ...pedido };

  res.send(pedidos[indexPedido]);
});

// Exclusão do pedido - Exclusão Lógica
// DELETE /pedidos/id -> cancelar um pedido
app.delete("/pedidos/:id", (req: Request, res: Response) => {
  const id_pedido = parseInt(req.params.id, 10);

  // Exclusão física - Apaga o pedido do array
  // const indexPedido = pedidos.findIndex((p) => p.id === id_pedido);
  // pedidos.splice(indexPedido, 1);
  // res.status(204).send();

  // Exclusão lógica - Altera o status para cancelado
  for (const pedido of pedidos) {
    if (pedido.id === id_pedido) {
      pedido.status = "cancelado";
      res.status(204).send();
      break;
    }
  }
});

const PORT = 3000;

// Escutar chamadas no meu servidor
app.listen(PORT);