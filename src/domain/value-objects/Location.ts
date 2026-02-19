export class Location {
  constructor(
    private readonly latitude: number,
    private readonly longitude: number,
    private readonly address: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.latitude < -90 || this.latitude > 90) {
      throw new Error("Latitude must be between -90 and 90.");
    }

    if (this.longitude < -180 || this.longitude > 180) {
      throw new Error("Longitude must be between -180 and 180.");
    }

    if (!this.address || this.address.trim().length === 0) {
      throw new Error("Address cannot be empty.");
    }
  }

  getLatitude(): number {
    return this.latitude;
  }

  getLongitude(): number {
    return this.longitude;
  }

  getAddress(): string {
    return this.address;
  }
}
