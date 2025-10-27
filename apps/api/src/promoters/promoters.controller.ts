import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PromotersService } from './promoters.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';

@ApiTags('promoters')
@Controller('promoters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromotersController {
  constructor(private readonly promotersService: PromotersService) {}

  @Post('leads')
  @ApiOperation({ summary: 'Add guest lead' })
  @ApiResponse({ status: 201, description: 'Lead added successfully' })
  async createLead(@Body() dto: CreateLeadDto, @CurrentUser() user: any) {
    return this.promotersService.createLead(user.userId, dto);
  }

  @Get('me/kpi')
  @ApiOperation({ summary: "Get promoter's KPI" })
  @ApiResponse({ status: 200, description: 'KPI data' })
  async getKPI(@CurrentUser() user: any) {
    return this.promotersService.getPromoterKPI(user.userId);
  }
}
