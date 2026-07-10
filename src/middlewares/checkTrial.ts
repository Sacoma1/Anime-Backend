import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

export const checkTrial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as any).user;

  if (!user || !user.expiresAt) {
    return res
      .status(403)
      .json({ error: "No se encontro fecha de expiracion " });
  }

  const now = new Date();
  const expiration = new Date(user.expiresAt);

  if (now > expiration) {
    return res.status(403).json({
      error: "Prueba terminada",
      message: "Tu demo de 3 dias ha finalizado",
    });
  }
  next();
};
