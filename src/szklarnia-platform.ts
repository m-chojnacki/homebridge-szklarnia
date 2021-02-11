import { AccessoryPlugin, API, Logging, PlatformConfig, StaticPlatformPlugin } from 'homebridge';
import { FanAccessory } from './fan-accessory';
import { FanController } from './fan-controller';
import { LightAccessory } from './light-accessory';
import { LightController } from './light-controller';
import { SensorAccessory } from './sensor-accessory';

export class SzklarniaPlatform implements StaticPlatformPlugin {
  private readonly lightController = new LightController(this.log, this.rPin, this.gPin, this.bPin);
  private readonly fan1Controller = new FanController(this.log, this.fan1Pin, this.fanMinimumSpeed);
  private readonly fan2Controller = new FanController(this.log, this.fan2Pin, this.fanMinimumSpeed);

  private get rPin(): number {
    return this.config['rPin'] as number ?? -1;
  }

  private get gPin(): number {
    return this.config['gPin'] as number ?? -1;
  }

  private get bPin(): number {
    return this.config['bPin'] as number ?? -1;
  }

  private get fanMinimumSpeed(): number {
    return this.config['fanMinimumSpeed'] as number ?? 0;
  }

  private get fan1Pin(): number {
    return this.config['fan1Pin'] as number ?? -1;
  }

  private get fan2Pin(): number {
    return this.config['fan2Pin'] as number ?? -1;
  }

  constructor(
    public readonly log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.api.on('shutdown', this.onShutdown.bind(this));
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void) {
    callback([
      new SensorAccessory(this.api.hap, this.log, 'Czujniczek'),
      new LightAccessory(this.api.hap, this.log, this.lightController, 'Światełko'),
      new FanAccessory(this.api.hap, this.log, this.fan1Controller, 'Wiatraczek 1'),
      new FanAccessory(this.api.hap, this.log, this.fan2Controller, 'Wiatraczek 2'),
    ]);
  }

  private onShutdown() {
    this.log.info('Releasing light controller');
    this.lightController.release();

    this.log.info('Releasing fan 1 controller');
    this.fan1Controller.release();

    this.log.info('Releasing fan 2 controller');
    this.fan2Controller.release();
  }
}