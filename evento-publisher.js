const amqp = require("amqplib");

const QUEUE = "productos.consultados";

async function publicarProductoConsultado(cantidadProductos) {
  const connection = await amqp.connect("amqps://hcilcnzt:K1l7qK0vUiVjBbeUivDHQPfBrBW_THgV@capybara.lmq.cloudamqp.com/hcilcnzt");
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, { durable: false });

  const evento = {
    eventoId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    tipo: "ProductoConsultado",
    fecha: new Date().toISOString(),
    origen: "soa-productos-service",
    totalProductosDevueltos: cantidadProductos,
  };

  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(evento)));
  console.log("[ESB] Evento ProductoConsultado publicado en RabbitMQ:", evento);

  await channel.close();
  await connection.close();
}

module.exports = { publicarProductoConsultado };