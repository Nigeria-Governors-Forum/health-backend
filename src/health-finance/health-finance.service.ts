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
    const yearNum = Number(year);

    const hFin = await this.prisma.hFin_2.findMany({
      where: {
        state,
        year: { gte: yearNum - 3, lte: yearNum },
      },
    });

    const formatYearlyData = (rows: typeof hFin, y: number) => {
      const budgeted = rows
        .filter((r) => r.year === y && r.status === 'Budgeted')
        .reduce((sum, r) => sum + (r.value || 0), 0);

      const actual = rows
        .filter((r) => r.year === y && r.status === 'Actual')
        .reduce((sum, r) => sum + (r.value || 0), 0);

      return { name: y.toString(), budgeted, actual };
    };

    const yearlyTotals: { name: string; budgeted: number; actual: number }[] = [];
    for (let y = yearNum - 3; y <= yearNum; y++) {
      yearlyTotals.push(formatYearlyData(hFin, y));
    }


    const summarizeIndicator = (indicator: string, condition: string) => {
      const rows = hFin.filter(
        (d) => d.indicator === indicator && d.status === condition && d.year === yearNum,
      );

      const grouped: Record<string, number> = {};
      rows.forEach((result) => {
        if (result.exp_type) {
          grouped[result.exp_type] =
            (grouped[result.exp_type] || 0) + (result.value || 0);
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
        color: colorMap[label] || '#6B7280',
      }));

      return {
        indicator,
        status: condition,
        total,
        currencyDenotation: getDenotation(total),
        breakdown,
        formattedTotal: formatNumber(total),
      };
    };

    const healthBudget = summarizeIndicator('Health Budget', 'Budgeted');
    const stateBudget = summarizeIndicator('State Budget', 'Budgeted');

    const perCapita = await this.prisma.lGA_PCap.findMany({
      where: { state, year: Number(year) },
    });

    const expenditure = await this.prisma.per_Capita.findMany({
      where: { state, year: Number(year) },
    });


    return {
      data: {
        yearlyTotals,
        health_budget: healthBudget,
        state_budget: stateBudget,
        perCapita,
        expenditure
      },
    };
  }
}

