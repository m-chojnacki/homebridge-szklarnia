import { readFile } from 'fs/promises';

export enum AM2301Status {
  Ok = 'ok',
  Checksum = 'checksum',
  Missing = 'missing'
}

export class AM2301Reading {
  constructor(
    readonly humidity: number,
    readonly temperature: number,
    readonly status: AM2301Status,
  ) { }
}

export class AM2301Sensor {
  async read(tries = 5): Promise<AM2301Reading> {
    let reading = await this.readSingle();

    for (let i = 0; i < tries && !this.isReadingCorrect(reading); i++) {
      reading = await this.readSingle();
    }

    return reading;
  }

  async readSingle(): Promise<AM2301Reading> {
    const result = await readFile('/proc/am2301', { encoding: 'ascii' });

    const split = result.trim().split(' ');
    if (split.length !== 3) {
      throw 'Sensor output format is not correct';
    }

    return new AM2301Reading(
      parseFloat(split[0]),
      parseFloat(split[1]),
      split[2] as AM2301Status,
    );
  }

  private isReadingCorrect(reading: AM2301Reading): boolean {
    return reading.status === AM2301Status.Ok
      && reading.temperature >= 10 && reading.temperature <= 40
      && reading.humidity >= 10 && reading.humidity <= 90;
  }
}