import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { error } from "node:console";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ error: "No autorizado, falta token de acceso" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await prisma.users.findUnique({
      where: { id: Number(decode.id) },
      select: {
        id: true,
        email: true,
        nickname: true,
        expiresAt: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Usuario no existente" });
    }

    (req as any).user = user;

    next();
  } catch (e: any) {
    console.error("Error al validadr token de acceso", e);
    return res.status(401).json({ error: "Token no valido o expirado" });
  }
};
