import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.js";

export const getAnimeLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { episodeId } = req.params;

  try {
    const episode = await prisma.episode.findUnique({
      where: { id: Number(episodeId) },
      select: {
        videoToken: true,
      },
    });

    if (!episode) {
      return res.status(401).json({
        error: "Fallo al encontrar capitulo",
        message: "Capitulo no encontrado",
      });
    }

    const url = `https://player.zilla-networks.com/m3u8/${episode.videoToken}`;

    return res.status(200).json({
      status: "Success",
      streamUrl: url,
    });
  } catch (e: any) {
    console.error("No se encontro link para el episodio seleccionado", e);
    res.status(500).json({ error: "Error en el link" });
  }
};
