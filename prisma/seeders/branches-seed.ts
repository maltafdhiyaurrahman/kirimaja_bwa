import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function branchesSeed() {
    const branchesPath = path.resolve(__dirname, 'data', 'branches.json');
    const branchesRaw = fs.readFileSync(branchesPath, 'utf-8');
    const branches = JSON.parse(branchesRaw).data;

    for (const branch of branches) {
        const exixtingBranch = await prisma.branch.findFirst({
            where: { name: branch.name }
        }); 
        
        if (!exixtingBranch) {
            await prisma.branch.create({
                data: {
                    name: branch.name,
                    address: branch.address,
                    phoneNumber: branch.phoneNumber
                }
            });
            console.log(`➕ Branch ${branch.name} seeded`);
        } else {
            console.log(`ℹ️  Branch ${branch.name} already exists, skipping`);
        }

        console.log(`✅ Branch seeded`);
    }
}

// For running directly
if (require.main === module) {
    branchesSeed()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
