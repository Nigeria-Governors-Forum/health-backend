import { Injectable } from '@nestjs/common';
import { CreateHealthFinanceDto } from './dto/create-health-finance.dto';
import { UpdateHealthFinanceDto } from './dto/update-health-finance.dto';
import { PrismaService } from 'src/prisma/prisma.service';

function formatNumber(n: number): string {
  if (n >= 1e18) return (n / 1e18).toFixed(2) + "Q";  // Quintillion
  if (n >= 1e15) return (n / 1e15).toFixed(2) + "P";  // Quadrillion
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";  // Trillion
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";    // Billion
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";    // Million
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";    // Thousand
  return n.toString();
}
function getDenotation(n: number): string {
  if (n >= 1e12) return 'T';
  if (n >= 1e9) return 'B';
  if (n >= 1e6) return 'M';
  return '';
}

@Injectable()
export class HealthFinanceService {
  constructor(private readonly prisma: PrismaService) { }

  create(createHealthFinanceDto: CreateHealthFinanceDto) {
    return 'This action adds a new healthFinance';
  }

  findAll() {
    return `This action returns all healthFinance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} healthFinance`;
  }

  update(id: number, updateHealthFinanceDto: UpdateHealthFinanceDto) {
    return `This action updates a #${id} healthFinance`;
  }

  remove(id: number) {
    return `This action removes a #${id} healthFinance`;
  }

  async getHealthFinanceData(state: string, year: string) {
    const hFin = await this.prisma.hFin_2.findMany({
      where: { state, year: Number(year) },
    });

    function summarizeIndicator(indicator: string) {
      const rows = hFin.filter((d) => d.indicator === indicator);

      // group by exp_type
      const grouped: Record<string, number> = {};
      rows.forEach((r) => {
        if (r.exp_type !== null && r.exp_type !== undefined) {
          grouped[r.exp_type] = (grouped[r.exp_type] || 0) + (r.value || 0);
        }
      });

      const total = Object.values(grouped).reduce((a, b) => a + b, 0);

      const colorMap: Record<string, string> = {
        Capital: '#3B82F6',
        Overhead: '#1E3A8A',
        Personnel: '#C9672A',
      };

      const breakdown = Object.entries(grouped).map(([label, amount]) => ({
        label,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        amount,
        formattedAmount: formatNumber(amount),
        color: colorMap[label] || '#6B7280',
      }));

      return {
        indicator,
        total,
        formattedTotal: formatNumber(total),
        currencyDenotation: getDenotation(total), // 👈 returns only T / B / M
        breakdown,
      };
    }

    const healthBudget = summarizeIndicator('Health Budget');
    const stateBudget = summarizeIndicator('State Budget');

    return {
      data: {
        raw: hFin,
        health_budget: healthBudget,
        state_budget: stateBudget,
      },
    };
  }
}
