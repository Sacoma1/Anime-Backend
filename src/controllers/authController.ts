import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateJwt.js";
import { verify } from "otplib";

export const signup = async (req: Request, res: Response) => {
  try {
    const { nickname, email, password } = req.body;

    const trialPeriod = new Date();
    trialPeriod.setDate(trialPeriod.getDate() + 3);

    if (!nickname || !email || !password)
      return res.status(400).json({ error: "Faltan datos" });

    //check is user already exist
    const userExists = await prisma.users.findUnique({
      where: { email: email, nickname: nickname },
    });

    if (userExists) {
      return res.status(400).json({ error: "Usuario o email registrado" });
    }

    //hash pass
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create user
    const user = await prisma.users.create({
      data: {
        email,
        nickname: nickname,
        password: hashedPassword,
        isActive: true,
        expiresAt: trialPeriod,
      },
    });
    const token = generateToken(user.id.toString(), res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          expiresAt: user.expiresAt,
          isActive: true,
        },
        token,
      },
    });
  } catch (e: any) {
    console.error("Error en registrar usuario", e);
    return res.status(500).json({ error: "error en el servidor" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Falta codigo de verificacion" });
    }
    const secret = process.env.ADMIN_PASSWORD || "";

    const { valid } = await verify({ secret, token: code });

    if (!valid) {
      return res.status(401).json({ error: "Codigo no valido" });
    }

    const token = generateToken("Admin", res);

    return res.status(200).json({
      status: "success",
      data: {
        role: "Admin",
        token,
      },
    });
  } catch (e: any) {
    console.error("Error en admin login", e);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
