import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OpenCageService } from 'src/common/opencage/opencage.service';
import { UserAddress } from '@prisma/client';

@Injectable()
export class UserAddressesService {
  constructor (
    private prismaService: PrismaService,
    private openCageService: OpenCageService
  ) {}

  private readonly UPLOADS_PATH = '/uploads/photos/'

  private generatePhotoPath(filename?: string): string | null {
    return filename ? `${this.UPLOADS_PATH}${filename}` : null;
  }

  private async getCoordinatesFromAdress(
    address: string
  ): Promise<{lat: number, lng: number}> {
    return await this.openCageService.geocode(address);
  }

  async create(createUserAddressDto: CreateUserAddressDto, userId: number, photoFileName?: string | null): Promise<UserAddress> {
    const {lat, lng} = await this.getCoordinatesFromAdress(
      createUserAddressDto.address
    )

    if (photoFileName) {
      createUserAddressDto.photo = this.generatePhotoPath(photoFileName)
    }

    return await this.prismaService.userAddress.create({
      data: {
        userId,
        address: createUserAddressDto.address,
        tag: createUserAddressDto.tag,
        label: createUserAddressDto.label,
        photo: createUserAddressDto.photo,
        latitude: lat,
        longitude: lng
      }
    })
  }

  async findAll(userId: number): Promise<UserAddress[]>{
    return await this.prismaService.userAddress.findMany({
      where: {
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            avatar: true,
          }
        }
      }
    })
  }

  async findOne(id: number):  Promise<UserAddress> {
    const userAddress = await this.prismaService.userAddress.findUnique({
      where: {
        id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        }
      }
    });

    if (!userAddress) {
      throw new NotFoundException(
        `User address with ID ${id} not found`
      )
    }

    return userAddress
  }

  async update(id: number, updateUserAddressDto: UpdateUserAddressDto, photoFileName?: string | null) {
    const userAddress = await this.findOne(id);

    let newLatitude: number = userAddress.latitude!
    let nweLongitude: number = userAddress.longitude!

    if (
      updateUserAddressDto.address &&
      updateUserAddressDto.address !== userAddress.address
    ) {
      const coordinates = await this.getCoordinatesFromAdress(
        updateUserAddressDto.address
      )

      newLatitude = coordinates.lat;
      nweLongitude  = coordinates.lng;
    }

    if (photoFileName) {
      updateUserAddressDto.photo = this.generatePhotoPath(photoFileName)
    }

    return await this.prismaService.userAddress.update({
      where: {
        id
      },
      data: {
        address: updateUserAddressDto.address ?? userAddress.address,
        tag: updateUserAddressDto.tag ?? userAddress.tag,
        label: updateUserAddressDto.label ?? userAddress.label,
        photo: updateUserAddressDto.photo ?? userAddress.photo,
        latitude: newLatitude,
        longitude: nweLongitude
      }
    })
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prismaService.userAddress.delete({
      where: {
        id
      }
    })

    console.log(`User address with ID ${id} deleted successfully`)
  }
}
