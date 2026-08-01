import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.js";

export const getAnimeLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { title, episodes } = req.params;

  try {
    const episode = await prisma.episode.findFirst({
      where: {
        number: Number(episodes),
        Animes: { link: decodeURIComponent(String(title)) },
      },
      select: {
        videoToken: true,
        number: true,
        Animes: {
          select: { link: true, id: true },
        },
      },
    });

    if (!episode) {
      return res.status(401).json({
        error: "Fallo al encontrar capitulo",
        message: "Capitulo no encontrado",
      });
    }

    const url = `https://monoschinos-api.duckdns.org/animes/stream-proxy/${episode.videoToken}`;

    return res.status(200).json({
      status: "Success",
      streamUrl: url,
    });
  } catch (e: any) {
    console.error("No se encontro link para el episodio seleccionado", e);
    res.status(500).json({ error: "Error en el link" });
  }
};

export const getStreamProxy = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: "Token no proporcionado" });
  }

  const targetUrl = `https://player.zilla-networks.com/m3u8/${token}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://player.zilla-networks.com/",
        Origin: "https://player.zilla-networks.com",
      },
    });

    if (!response.ok) {
      console.error(
        `Error de Zilla: ${response.status} ${response.statusText}`,
      );
      return res
        .status(response.status)
        .json({ error: "El servidor de video rechazo la peticion" });
    }

    const manifestText = await response.text();

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).send(manifestText);
  } catch (error: any) {
    console.error("Error en el proxy de streaming:", error);
    return res
      .status(500)
      .json({ error: "Fallo interno al conectar con el servidor de video" });
  }
};
