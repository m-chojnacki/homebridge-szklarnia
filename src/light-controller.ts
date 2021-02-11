import { Logging } from 'homebridge';
import { PiBlaster } from './pi-blaster';

export class LightController {
  isOn = false;

  private _hue = 0.0;
  private _saturation = 0.0;
  private _brightness = 0.0;

  get hue(): number {
    return this._hue;
  }

  set hue(newValue: number) {
    this._hue = Math.min(Math.max(newValue, 0.0), 360.0);
  }

  get saturation(): number {
    return this._saturation;
  }

  set saturation(newValue: number) {
    this._saturation = Math.min(Math.max(newValue, 0.0), 100.0);
  }

  get brightness(): number {
    return this._brightness;
  }

  set brightness(newValue: number) {
    this._brightness = Math.min(Math.max(newValue, 0.0), 100.0);
  }

  constructor(
    private readonly log: Logging,
    private readonly rPin: number,
    private readonly gPin: number,
    private readonly bPin: number,
    private readonly piBlaster = new PiBlaster(),
    private readonly shouldReleasePins = false,
  ) { }

  async updateLight() {
    if (this.rPin === -1 || this.gPin === -1 || this.bPin === -1) {
      throw 'RGB pins were not set in the config';
    }

    const [r, g, b] = this.hsv2rgb(this.hue, this.saturation / 100.0, this.brightness / 100.0);

    const rPwm = this.isOn ? Math.min(Math.max(1.0 - r, 0.0), 1.0) : 1.0;
    const gPwm = this.isOn ? Math.min(Math.max(1.0 - g, 0.0), 1.0) : 1.0;
    const bPwm = this.isOn ? Math.min(Math.max(1.0 - b, 0.0), 1.0) : 1.0;

    this.log.debug(`Setting PWM values: ${this.rPin}=${rPwm.toFixed(2)} ${this.gPin}=${gPwm.toFixed(2)} ${this.bPin}=${bPwm.toFixed(2)}`);

    await this.piBlaster.pwm([this.rPin, rPwm], [this.gPin, gPwm], [this.bPin, bPwm]);
  }

  async release() {
    this.isOn = false;
    await this.updateLight();

    if (this.shouldReleasePins) {
      for (const pin of [this.rPin, this.gPin, this.bPin]) {
        this.log.debug(`Releasing PWM pin: ${pin}`);
        await this.piBlaster.release(pin);
      }
    }
  }

  private hsv2rgb(h: number, s: number, v: number): [r: number, g: number, b: number] {
    const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);

    return [f(5), f(3), f(1)];
  }
}