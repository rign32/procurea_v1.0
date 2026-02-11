import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.supplier.findMany({
            include: {
                campaign: true,
                offers: true,
            },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string) {
        return this.prisma.supplier.findUnique({
            where: { id },
            include: {
                campaign: true,
                offers: true,
                documentChunks: true
            }
        });
    }

    async update(id: string, data: any) {
        return this.prisma.supplier.update({
            where: { id },
            data
        });
    }
}
