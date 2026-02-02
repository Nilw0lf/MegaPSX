import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./lib/prisma";

const server = Fastify({ logger: true });

const port = Number(process.env.PORT || 8787);
const webOrigin = process.env.WEB_ORIGIN || "http://localhost:5173";

await server.register(cors, {
  origin: [webOrigin, "http://localhost:3000"],
  methods: ["GET"]
});

server.get("/api/health", async () => ({ ok: true, time: new Date().toISOString() }));

server.get("/api/symbols", async (request, reply) => {
  const q = (request.query as { q?: string }).q?.trim();
  const where = q
    ? {
        OR: [
          { symbol: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } }
        ]
      }
    : undefined;
  const symbols = await prisma.symbol.findMany({
    where,
    orderBy: { symbol: "asc" },
    take: q ? 100 : 50
  });
  return reply.send(symbols);
});

server.get("/api/quote/:symbol", async (request, reply) => {
  const symbol = (request.params as { symbol: string }).symbol.toUpperCase();
  const latest = await prisma.dailyPrice.findFirst({
    where: { symbol },
    orderBy: { date: "desc" }
  });
  if (!latest) {
    return reply.status(404).send({
      message: `No daily prices stored for ${symbol}. Run the ingest script first.`
    });
  }
  return reply.send(latest);
});

server.get("/api/history/:symbol", async (request, reply) => {
  const { symbol } = request.params as { symbol: string };
  const { from, to } = request.query as { from?: string; to?: string };
  const now = new Date();
  const start = from ? new Date(from) : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const end = to ? new Date(to) : now;

  const rows = await prisma.dailyPrice.findMany({
    where: {
      symbol: symbol.toUpperCase(),
      date: { gte: start, lte: end }
    },
    orderBy: { date: "asc" }
  });

  return reply.send(rows);
});

const start = async () => {
  try {
    await server.listen({ port, host: "0.0.0.0" });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();
