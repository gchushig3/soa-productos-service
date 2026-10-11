const amqp = require("amqplib");
const { randomUUID } = require("crypto");

const QUEUE = "productos.consultados";

async function publicarProductoConsultado(cantidadProductos) {
  const amqpUrl = process.env.AMQP_URL;
  if (!amqpUrl) throw new Error("Falta configurar AMQP_URL");

  const connection = await amqp.connect(amqpUrl);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, { durable: false });

  const evento = {
    eventoId: randomUUID(),
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