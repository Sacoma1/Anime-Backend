import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { rmSync } from "node:fs";

export const getAllAnimes = async (req: Request, res: Response) => {
  try {
    const getAllAnimes = await prisma.animes.findMany({
      include: {
        Episode: true,
      },
      take: 20,
    });

    if (getAllAnimes.length === 0) {
      return res.status(200).json({ message: "No hay animes para mostrar" });
    }
    res.status(200).json({
      status: "success",
      results: getAllAnimes.length,
      data: { animes: getAllAnimes },
    });
  } catch (e: any) {
    console.error("No se pudo conectar a la db", e);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor " });
  }
};

export const getAnimeById = async (req: Request, res: Response) => {
  try {
    const { animeTitle } = req.params as { animeTitle: string };
    const getAnime = await prisma.animes.findUnique({
      where: { link: animeTitle },
      include: {
        Episode: { orderBy: { number: "asc" } },
      },
    });
    if (!getAnime) {
      return res
        .status(404)
        .json({ message: "No se encontro informacion el anime solicitado" });
    }

    res.status(200).json({ status: "Success", data: { anime: getAnime } });
  } catch (e: any) {
    console.error(
      "Error al obtener la informacion del anime en la base de datos",
      e,
    );
    res.status(500).json({
      status: "error",
      message: "Error al obtener informacion del anime",
    });
  }
};

export const getAnimeOnAir = async (req: Request, res: Response) => {
  try {
    const thisSeason = await prisma.animes.findMany({
      where: { status: "Currently airing" },
    });
    if (!thisSeason) {
      return res.status(200).json({
        message: "No hay informacion de los animes de esta temporada",
      });
    }
    res.status(200).json({
      status: "Success",
      content: thisSeason.length,
      data: { animes: thisSeason },
    });
  } catch (e: any) {
    console.error("No se pudo obtener la informacion de animes de temporada");
    res.status(500).json({
      status: "error",
      message: "Error al obtener informacion ",
    });
  }
};

export const getBestAnimes = async (req: Request, res: Response) => {
  try {
    const bestAnimes = await prisma.animes.findMany({
      where: { score: { gt: 8.5 } },
      take: 15,
    });

    if (!bestAnimes)
      return res
        .status(200)
        .json({ message: "No hay informacion de los mejores animes" });

    res.status(200).json({
      status: "Success",
      content: bestAnimes.length,
      data: { animes: bestAnimes },
    });
  } catch (e: any) {
    console.error("No se pudo obtener la informacion de los mejores animes ");
    res.status(500).json({
      status: "error",
      message: "Error al obtener la informacion",
    });
  }
};

export const getRandomAnime = async (req: Request, res: Response) => {
  try {
    const bestAnimes = await prisma.animes.findMany({
      where: { score: { gt: 8.5 } },
      take: 15,
    });

    if (!bestAnimes) {
      return res
        .status(200)
        .json({ message: "No hay informacion de los mejores animes" });
    }

    const randomAnime = Math.floor(Math.random() * bestAnimes.length);
    res.status(200).json({
      status: "Success",
      data: { animes: bestAnimes[randomAnime] },
    });
  } catch (e: any) {}
};
