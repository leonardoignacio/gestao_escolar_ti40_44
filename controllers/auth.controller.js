import { SignJWT } from 'jose'
import argon2 from 'argon2'
import dotenv from 'dotenv'
dotenv.config()
import prisma from '../config/database.js'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

// Função de Login 
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body

    // 1. Busca o usuário apenas pelo e-mail
    const usuario = await prisma.usuario.findFirst({
      where: { email }
    })

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' })
    }
    // 2. Compara a senha enviada (texto) com a senha guardada (hash)
    const senhaValida = await argon2.verify(usuario.senha, senha)

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' })
    }

    // 3. Se passou, gera o token normalmente
    const payload = { id: usuario.id, nome: usuario.nome }
    const token = new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .setSubject(payload.id.toString())
        .setIssuer('api-auth')
        .setAudience('web-app')
        .sign(SECRET)
    return res.status(200).json({ 
      token, 
      usuario: { id: usuario.id, nome: usuario.nome } 
    })
  } catch (error) {
    return res.status(500).json({ erro: error.message })
  }
}

// Middleware rigoroso (Para rotas administrativas)
export const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ erro: 'Token não informado' })
        //     0                1
        // ['Bearer', 'cxjldkjldzsldfldsflçdsfçdslfçds']
    const token = authHeader.split(' ')[1]
    const payload = jwt.verify(token, SECRET)
    
    req.usuarioId = payload.id 
    next() 
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
}

// Middleware brando (Para a vitrine pública de pets)
export const autenticarOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      const { payload } = await jwtVerify(token, SECRET)
      req.usuarioId = payload.id
    }
  } catch (error) {
    // Visitante anônimo
    res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
  next()
}