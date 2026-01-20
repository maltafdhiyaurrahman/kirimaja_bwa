import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Shipment } from "@prisma/client";
import { PaymentStatus } from "src/common/enum/payment-status.enum";
import { ShipmentStatus } from "src/common/enum/shipment-status.enum";
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class ShipmentCourierService {
    constructor (
        private prismaService: PrismaService
    ) {}

    async findAll(): Promise<Shipment[]> {
        return this.prismaService.shipment.findMany({
            where: {
                paymentStatus: PaymentStatus.PAID,
                deliveryStatus: {
                    in: [
                        ShipmentStatus.READY_TO_PICKUP,
                        ShipmentStatus.WAITING_PICKUP,
                        ShipmentStatus.PICKED_UP,
                        ShipmentStatus.READY_TO_PICKUP_AT_BRANCH,
                        ShipmentStatus.READY_TO_DELIVER,
                        ShipmentStatus.ON_THE_WAY_TO_ADDRESS,
                        ShipmentStatus.ON_THE_WAY,
                        ShipmentStatus.DELIVERED,
                    ]
                }
            },
            include: {
                shipmentDetail: {
                    include: { user: true, address: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    async pickShipment(
        trackingNumber: string,
        userId: number
    ): Promise<Shipment> {
        const shipment = await this.prismaService.shipment.findFirst({
            where: {
                trackingNumber
            },
            include: {
                shipmentDetail: true,
                shipmentHistory: true,
                payment: true
            }
        })

        if (!shipment) {
            throw new NotFoundException(
                `Shipment with tracking number ${trackingNumber} not found`
            )
        }

        const userBranch = await this.prismaService.employeeBranch.findFirst({
            where: {
                userId
            },
            select: {
                branchId: true
            }
        })

        if (!userBranch) {
            throw new NotFoundException(
                `User with ID ${userId} not found in any branch`
            )
        }

        return this.prismaService.$transaction(async (prisma)=> {
            const updateShipment = await prisma.shipment.update({
                where: {
                    id: shipment.id
                },
                data: {
                    deliveryStatus: ShipmentStatus.WAITING_PICKUP
                }
            })

            await prisma.shipmentHistory.create({
                data: {
                    shipmentId: updateShipment.id,
                    userId: userId,
                    branchId: userBranch.branchId,
                    status: ShipmentStatus.WAITING_PICKUP,
                    description: `Shipment picked up by user with ID ${userId}`
                }
            })

            return updateShipment
        })
    }

    async pickupShipment(
        trackingNumber: string,
        userId: number,
        pickupProofImage: string
    ): Promise<Shipment> {
        if (!pickupProofImage) {
            throw new UnprocessableEntityException(
                `Pickup proof image is required`
            )
        }

        const shipment = await this.prismaService.shipment.findFirst({
            where: {
                trackingNumber
            },
            include: {
                shipmentDetail: true,
                shipmentHistory: true,
                payment: true
            }
        })

        if (!shipment) {
            throw new NotFoundException(
                `Shipment with tracking number ${trackingNumber} not found`
            )
        }

        const userBranch = await this.prismaService.employeeBranch.findFirst({
            where: {
                userId
            },
            select: {
                branchId: true
            }
        })

        if (!userBranch) {
            throw new NotFoundException(
                `User with ID ${userId} not found in any branch`
            )
        }

        return this.prismaService.$transaction(async (prisma)=> {
            const updateShipment = await prisma.shipment.update({
                where: {
                    id: shipment.id
                },
                data: {
                    deliveryStatus: ShipmentStatus.PICKED_UP
                }
            })

            await prisma.shipmentHistory.create({
                data: {
                    shipmentId: updateShipment.id,
                    userId: userId,
                    branchId: userBranch.branchId,
                    status: ShipmentStatus.PICKED_UP,
                    description: `Shipment picked up by user with ID ${userId}`
                }
            })

            await prisma.shipmentDetail.update({
                where: {
                    shipmentId: updateShipment.id
                },
                data: {
                    pickupProof: `uploads/photos/${pickupProofImage}`
                }
            })

            return updateShipment
        })
    }

    async deliverToBranch(
        trackingNumber: string,
        userId: number
    ): Promise<Shipment> {
        const shipment = await this.prismaService.shipment.findFirst({
            where: {
                trackingNumber
            },
            include: {
                shipmentDetail: true,
                shipmentHistory: true,
                payment: true
            }
        })

        if (!shipment) {
            throw new NotFoundException(
                `Shipment with tracking number ${trackingNumber} not found`
            )
        }

        const userBranch = await this.prismaService.employeeBranch.findFirst({
            where: {
                userId
            },
            select: {
                branchId: true
            }
        })

        if (!userBranch) {
            throw new NotFoundException(
                `User with ID ${userId} not found in any branch`
            )
        }

        return this.prismaService.$transaction(async (prisma)=> {
            const updateShipment = await prisma.shipment.update({
                where: {
                    id: shipment.id
                },
                data: {
                    deliveryStatus: ShipmentStatus.READY_TO_PICKUP_AT_BRANCH
                }
            })

            await prisma.shipmentHistory.create({
                data: {
                    shipmentId: updateShipment.id,
                    userId: userId,
                    branchId: userBranch.branchId,
                    status: ShipmentStatus.READY_TO_PICKUP_AT_BRANCH,
                    description: `Shipment picked up by user with ID ${userId}`
                }
            })

            return updateShipment
        })
    }

    async pickShipmentFromBranch(
        trackingNumber: string,
        userId: number
    ): Promise<Shipment> {
        const shipment = await this.prismaService.shipment.findFirst({
            where: {
                trackingNumber
            },
            include: {
                shipmentDetail: true,
                shipmentHistory: true,
                payment: true
            }
        })

        if (!shipment) {
            throw new NotFoundException(
                `Shipment with tracking number ${trackingNumber} not found`
            )
        }

        const userBranch = await this.prismaService.employeeBranch.findFirst({
            where: {
                userId
            },
            select: {
                branchId: true
            }
        })

        if (!userBranch) {
            throw new NotFoundException(
                `User with ID ${userId} not found in any branch`
            )
        }

        return this.prismaService.$transaction(async (prisma)=> {
            const updateShipment = await prisma.shipment.update({
                where: {
                    id: shipment.id
                },
                data: {
                    deliveryStatus: ShipmentStatus.READY_TO_DELIVER
                }
            })

            await prisma.shipmentHistory.create({
                data: {
                    shipmentId: updateShipment.id,
                    userId: userId,
                    branchId: userBranch.branchId,
                    status: ShipmentStatus.READY_TO_DELIVER,
                    description: `Shipment picked up by user with ID ${userId}`
                }
            })

            return updateShipment
        })
    }

    async pickupShipmentFromBranch(
        trackingNumber: string,
        userId: number
    ): Promise<Shipment> {
        const shipment = await this.prismaService.shipment.findFirst({
            where: {
                trackingNumber
            },
            include: {
                shipmentDetail: true,
                shipmentHistory: true,
                payment: true
            }
        })

        if (!shipment) {
            throw new NotFoundException(
                `Shipment with tracking number ${trackingNumber} not found`
            )
        }

        const userBranch = await this.prismaService.employeeBranch.findFirst({
            where: {
                userId
            },
            select: {
                branchId: true
            }
        })

        if (!userBranch) {
            throw new NotFoundException(
                `User with ID ${userId} not found in any branch`
            )
        }

        return this.prismaService.$transaction(async (prisma)=> {
            const updateShipment = await prisma.shipment.update({
                where: {
                    id: shipment.id
                },
                data: {
                    deliveryStatus: ShipmentStatus.ON_THE_WAY_TO_ADDRESS
                }
            })

            await prisma.shipmentHistory.create({
                data: {
                    shipmentId: updateShipment.id,
                    userId: userId,
                    branchId: userBranch.branchId,
                    status: ShipmentStatus.ON_THE_WAY_TO_ADDRESS,
                    description: `Shipment picked up by user with ID ${userId}`
                }
            })

            return updateShipment
        })
    }

    async deliverToCustomer(
        trackingNumber: string,
        userId: number,
        recieptProofImage: string
    ): Promise<Shipment> {
        if (!recieptProofImage) {
            throw new UnprocessableEntityException(
                `Pickup proof image is required`
            )
        }

        const shipment = await this.prismaService.shipment.findFirst({
            where: {
                trackingNumber
            },
            include: {
                shipmentDetail: true,
                shipmentHistory: true,
                payment: true
            }
        })

        if (!shipment) {
            throw new NotFoundException(
                `Shipment with tracking number ${trackingNumber} not found`
            )
        }

        const userBranch = await this.prismaService.employeeBranch.findFirst({
            where: {
                userId
            },
            select: {
                branchId: true
            }
        })

        if (!userBranch) {
            throw new NotFoundException(
                `User with ID ${userId} not found in any branch`
            )
        }

        return this.prismaService.$transaction(async (prisma)=> {
            const updateShipment = await prisma.shipment.update({
                where: {
                    id: shipment.id
                },
                data: {
                    deliveryStatus: ShipmentStatus.DELIVERED
                }
            })

            await prisma.shipmentHistory.create({
                data: {
                    shipmentId: updateShipment.id,
                    userId: userId,
                    branchId: userBranch.branchId,
                    status: ShipmentStatus.DELIVERED,
                    description: `Shipment picked up by user with ID ${userId}`
                }
            })

            await prisma.shipmentDetail.update({
                where: {
                    shipmentId: updateShipment.id
                },
                data: {
                    recieptProof: `uploads/photos/${recieptProofImage}`
                }
            })

            return updateShipment
        })
    }
}