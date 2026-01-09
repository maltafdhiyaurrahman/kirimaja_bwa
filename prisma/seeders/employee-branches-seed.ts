import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function employeeBranchesSeed() {
    const employeeBranchPath = path.resolve(__dirname, 'data', 'employee-branches.json');
    const employeeBranchesRaw = fs.readFileSync(employeeBranchPath, 'utf-8');
    const employeeBranches = JSON.parse(employeeBranchesRaw).data;

    for (const empBranch of employeeBranches) {
        const role = await prisma.role.findFirst({
            where: { key: empBranch.role_key }
        });

        if (!role) {
            console.error(
                `Role with key ${empBranch.role_key} not found, skipping employee branch creation`
            );
            continue;
        }

        const branch = await prisma.branch.findFirst({
            where: {name: empBranch.branch_name}
        });

        if (!branch) {
            console.error(
                `Branch with name ${empBranch.branch_name} not found, skipping employee branch creation`
            );
            continue;
        }

        const user = await prisma.user.upsert({
            where: {email: empBranch.email},
            update: {},
            create: {
                name: empBranch.name,
                email: empBranch.email,
                phoneNumber: empBranch.phoneNumber,
                password: await bcrypt.hash(empBranch.password, 10),
                avatar: empBranch.avatar || null,
                roleId: role.id
            }
        });

        const exsistingEmployeeBranch = await prisma.employeeBranch.findFirst({
            where: {
                userId: user.id,
                branchId: branch.id
            }
        })

        if (exsistingEmployeeBranch) {
            console.log(
                `Employee branch for user ${user.email} at branch ${branch.name} allready exist, skipping`
            );
            continue;
        }

        await prisma.employeeBranch.create({
            data: {
                userId: user.id,
                branchId: branch.id,
                type: empBranch.type,
            }
        });

        console.log(
            `Employee branch for user ${user.email} at branch ${branch.name} seeded successfully`
        )
    }   
}

// For running directly
if (require.main === module) {
    employeeBranchesSeed()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
