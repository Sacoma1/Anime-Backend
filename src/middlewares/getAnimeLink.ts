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

    const url = `https://player.zilla-networks.com/m3u8/${episode.videoToken}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://player.zilla-networks.com/",
        Origin: "https://player.zilla-networks.com",
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "No se pudo obtener el stream de Zilla" });
    }

    const m3u8Content = await response.text();
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    return res.status(200).send(m3u8Content);
  } catch (e: any) {
    console.error("No se encontro link para el episodio seleccionado", e);
    res.status(500).json({ error: "Error en el link" });
  }
};
