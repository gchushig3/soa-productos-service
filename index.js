const express = require("express");
const soap = require("soap");
const fs = require("fs");
const path = require("path");
const { PRODUCTOS } = require("./productos");
const { publicarProductoConsultado } = require("./evento-publisher");

const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(express.raw({ type: () => true, limit: "2mb" }));

const service = {
  ProductoService: {
    ProductoServicePort: {
      ObtenerProductos: function (args, callback) {
        console.log("[SOA] ObtenerProductos invocado");
        const respuesta = { productos: PRODUCTOS.map((p) => `${p.id}|${p.nombre}|${p.precio}`) };
        publicarProductoConsultado(PRODUCTOS.length)
          .catch((err) => console.error("[ESB] Error publicando evento:", err.message))
          .finally(() => callback(null, respuesta));
      },
    },
  },
};

const wsdlPath = path.join(__dirname, "productos.wsdl");
const soapPublicUrl = process.env.SOAP_PUBLIC_URL || `http://localhost:${port}/wsdl`;
const wsdlXml = fs
  .readFileSync(wsdlPath, "utf8")
  .replace("http://localhost:3000/wsdl", soapPublicUrl);

const server = app.listen(port, () => {
  console.log(`Servicio SOA escuchando en el puerto ${port}`);
});

soap.listen(server, "/wsdl", service, wsdlXml);