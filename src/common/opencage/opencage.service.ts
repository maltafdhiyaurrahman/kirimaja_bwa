import { BadRequestException, Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()

export class OpenCageService {
    async geocode(address: string): Promise<{lat: number, lng: number}> {
        const apiKey = process.env.OPENCAGE_API_KEY;

        if (!apiKey) {
            throw new BadRequestException(
                "OpenCage API key is not set in environtment variables."
            )
        }

        try {
            const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
                params: {
                    q: address,
                    key: apiKey,
                    limit: 1
                },
            });

            const result = response.data.results?.[0];

            if (!result) {
                throw new BadRequestException(
                    "No results found for the provide address."
                )
            }

            return {
                lat: result.geometry.lat,
                lng: result.geometry.lng
            }
        } catch (error) {
            console.error("OpenCage geocode error", error);
            throw new BadRequestException(
                "Failed to geocode the address. Please check the address and try again."
            );
        }
    }
}