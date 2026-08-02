import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.js";

// export const getAnimeLink = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { title, episodes } = req.params;

//   try {
//     const episode = await prisma.episode.findFirst({
//       where: {
//         number: Number(episodes),
//         Animes: { link: decodeURIComponent(String(title)) },
//       },
//       select: {
//         videoToken: true,
//         number: true,
//         Animes: {
//           select: { link: true, id: true },
//         },
//       },
//     });

//     if (!episode) {
//       return res.status(401).json({
//         error: "Fallo al encontrar capitulo",
//         message: "Capitulo no encontrado",
//       });
//     }

//     const url = `https://player.zilla-networks.com/m3u8/${episode.videoToken}`;

//     return res.status(200).json({
//       status: "Success",
//       streamUrl: url,
//     });
//   } catch (e: any) {
//     console.error("No se encontro link para el episodio seleccionado", e);
//     res.status(500).json({ error: "Error en el link" });
//   }
// };
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

    const playerUrl = `https://player.zilla-networks.com/m3u8/${episode.videoToken}`;

    // 1. Hacemos la petición al player de Zilla desde Node.js
    const response = await fetch(playerUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://zilla-networks.com/",
      },
    });

    const html = await response.text();

    // 2. Extraemos la URL real del manifiesto HLS (.m3u8) que Zilla carga internamente
    const m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/);

    // Si la encuentra, manda el .m3u8 real; si no, manda la URL base por fallback
    const directStreamUrl = m3u8Match ? m3u8Match[1] : playerUrl;

    return res.status(200).json({
      status: "Success",
      streamUrl: directStreamUrl,
    });
  } catch (e: any) {
    console.error("No se encontro link para el episodio seleccionado", e);
    res.status(500).json({ error: "Error en el link" });
  }
};
