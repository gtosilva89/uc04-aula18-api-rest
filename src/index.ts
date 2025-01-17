import express, { Request, Response } from "express";

// Criando instancia do servidor
const app = express();

// A API vai suportar o recebimento e envio de JSON
app.use(express.json())

const resourceHello = (req: Request, res: Response) => {
  console.log(req.ip);
  res.send({ message: "Hello Word"})
}

// Chamada do tipo GET para o recurso /hello
app.get("/hello", resourceHello);

const PORT = 3000;

// Escutar chamados no meu servidor
app.listen(PORT);
