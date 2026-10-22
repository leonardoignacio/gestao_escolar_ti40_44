import argon2 from 'argon2' //import bcrypt from 'bcrypt'
import prisma from '../config/database.js'

export const listar = async (req, res) => {
  try {
    const { tabela } = req.params
    let queryArgs = {}

    const dados = await prisma[tabela].findMany(queryArgs)
    res.status(200).json(dados)
  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
}

export const criar = async (req, res) => {
  try {
    const { tabela } = req.params
    const dados = req.body

    // REGRA DE SEGURANÇA: Criptografia de Senha
    if (tabela === 'usuario' && dados.senha) {
      dados.senha = await argon2.hash(dados.senha)
    }
    const novo = await prisma[tabela].create({ data: dados })    
    // Removemos a senha do objeto de retorno por segurança
    if (tabela === 'usuario') {
      delete novo.senha
    }

    res.status(201).json(novo)
  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
}

export const atualizar = async (req, res) => {
  try {
    const { tabela, id } = req.params
    // Se houver atualização de senha, criptografa novamente
    if (tabela === 'usuario' && req.body.senha) {
      req.body.senha = await argon2.hash(req.body.senha)
    }
    const atualizado = await prisma[tabela].update({
      where: { id: Number(id) },
      data: req.body
    })
    if (tabela === 'usuario') delete atualizado.senha
    res.status(200).json(atualizado)

  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
}

export const remover = async (req, res) => {
  try {
    const { tabela, id } = req.params
    
    await prisma[tabela].delete({ where: { id: Number(id) } })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
}