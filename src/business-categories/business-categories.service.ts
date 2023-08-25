import { Injectable } from '@nestjs/common';
import { BusinessCategory } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BusinessCategoriesService {
  constructor(private prisma: PrismaService) {}

  async getBusinessCategories() {
    const categories: Array<{
      label: string;
      value: BusinessCategory;
    }> = [
      {
        label: 'Automobilístico',
        value: 'AUTOMOTIVE',
      },
      {
        label: 'Banco',
        value: 'BANK',
      },
      {
        label: 'Bens de consumo',
        value: 'CONSUMER_GOODS',
      },
      {
        label: 'Comidas e bebidas',
        value: 'FOOD_AND_BEVERAGES',
      },
      {
        label: 'Construção civil',
        value: 'CONSTRUCTION_COMPANY',
      },
      {
        label: 'Educação',
        value: 'EDUCATION',
      },
      {
        label: 'Farmacêuticos e químicos',
        value: 'PHARMACEUTICAL_AND_CHEMICALS',
      },
      {
        label: 'Hospital e plano de saúde',
        value: 'HOSPITAL_AND_HEALTH_PLAN',
      },
      {
        label: 'Indústria',
        value: 'INDUSTRY',
      },
      {
        label: 'Logística',
        value: 'LOGISTICS',
      },
      {
        label: 'Mídia e propaganda',
        value: 'MEDIA_AND_ADVERTISING',
      },
      {
        label:
          'Organização Não Governamental (ONG)',
        value: 'NGO',
      },
      {
        label: 'Petróleo, energético e ambiental',
        value: 'OIL_ENERGY_AND_ENVIRONMENTAL',
      },
      {
        label: 'Saúde e bem-estar',
        value: 'HEALTH_AND_WELL_BEING',
      },
      {
        label: 'Seguradora',
        value: 'INSURANCE_COMPANY',
      },
      {
        label: 'Serviços financeiros',
        value: 'FINANCIAL_SERVICES',
      },
      {
        label: 'TI e telecomunicações',
        value: 'IT_AND_TELECOMMUNICATIONS',
      },
      {
        label: 'Varejo',
        value: 'RETAIL',
      },
    ];
    return categories;
  }
}
