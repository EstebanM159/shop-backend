import productsRoute from "./routes/productsRoutes";
import server from "./server";
import express from "express";
const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Api funcionando en el puerto ${port}`);
});
server.use(express.json());
server.use("/api/products", productsRoute);
