import { Controller, Post, Body, BadRequestException, Get, UseGuards, Req, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Usuario } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('cadastramento')
  async register(@Body() userData: Partial<Usuario>) {
    try {
      return await this.usersService.create(userData);
    } catch (error) {
      throw new BadRequestException((error as any).message);
    }
  }
  @Get('salas-estudo')
  async getSalasEstudo(@Req() req: Request) {
    const email = req.user && (req.user as any).email;
    if (!email) {
      throw new BadRequestException('Email é obrigatório');
    }
    return this.usersService.getSalasEstudoByEmail(email);
  }

  @Get('materias')
  async getMaterias(@Req() req: Request) {
    return this.usersService.getMateriasByUserId((req.user as any).userId);
  }

  @Post('materias')
  async createMateria(@Req() req: Request, @Body() body: { nome: string; cor: string; icone: string }) {
    if (!body.nome || !body.cor || !body.icone) {
      throw new BadRequestException('Todos os campos são obrigatórios.');
    }
    if (!req.user || !(req.user as any).userId) {
      throw new BadRequestException('Usuário não autenticado.');
    }
    return this.usersService.createMateria((req.user as any).userId, body);
  }

  @Post('materias/:materiaId/material/:materialId')
  async addMaterialToMateria(
    @Param('materiaId') materiaId: string,
    @Param('materialId') materialId: string
  ) {
    return this.usersService.addMaterialToMateria(materiaId, materialId);
  }

  @Post('materias/:materiaId/tempo-ativo')
  async atualizarTempoAtivoEMarcarRevisao(
    @Param('materiaId') materiaId: string,
    @Body() body: { minutos: number }
  ) {
    if (!body.minutos) {
      throw new BadRequestException('Minutos é obrigatório.');
    }
    return this.usersService.atualizarTempoAtivoEMarcarRevisao(materiaId, body.minutos);
  }
}
