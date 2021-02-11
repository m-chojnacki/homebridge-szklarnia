import { Logging } from 'homebridge';
import { PiBlaster } from './pi-blaster';

export class FanController {
  isOn = false;

  private _speed = 0.0;

  get speed(): number {
    return this._speed;
  }

  set speed(newValue: number) {
    this._speed = Math.min(Math.max(newValue, 0.0), 100.0);
  }

  constructor(
    private readonly log: Logging,
    private readonly pin: number,
    private readonly minimumSpeed: number,
    private readonly piBlaster = new PiBlaster(),
    private readonly shouldReleasePins = false,
  ) { }

  async updateFan() {
    if (this.pin === -1) {
      throw 'Fan pin were not set in the config';
    }

    const max = 100.0;
    const normalizedMinimumSpeed = this.minimumSpeed / max;
    const normalizedSpeed = this.speed / max;
    const value = normalizedMinimumSpeed + normalizedSpeed * (1.0 - normalizedMinimumSpeed);
    const pwm = this.isOn ? Math.min(Math.max(1.0 - value, 0.0), 1.0) : 1.0;

    this.log.debug(`Setting PWM value: ${this.pin}=${pwm.toFixed(2)}`);

    await this.piBlaster.pwm([this.pin, pwm]);
  }

  async release() {
    this.isOn = false;
    await this.updateFan();

    if (this.shouldReleasePins) {
      this.log.debug(`Releasing PWM pin: ${this.pin}`);
      await this.piBlaster.release(this.pin);
    }
  }
}