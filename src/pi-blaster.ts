import { open } from 'fs/promises';

type PinValue = [pin: number, value: number];

export class PiBlaster {
  async pwm(...pinValues: PinValue[]) {
    const command = pinValues
      .map((pinValue) => `${pinValue[0]}=${pinValue[1].toFixed(4)}`)
      .join(' ');

    await this.command(command);
  }

  async release(pin: number) {
    await this.command(`release ${pin}`);
  }

  async command(command: string) {
    const fd = await open('/dev/pi-blaster', 'w');
    await fd.write(`${command}\n`, -1);
    await fd.close();
  }
}