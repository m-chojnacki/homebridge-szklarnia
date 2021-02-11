import {
  AccessoryPlugin,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
} from 'homebridge';
import { FanController } from './fan-controller';

export class FanAccessory implements AccessoryPlugin {
  private readonly informationService: Service;
  private readonly fanService: Service;

  constructor(
    hap: HAP,
    private readonly log: Logging,
    private readonly fanController: FanController,
    readonly name: string,
  ) {
    this.informationService = new hap.Service.AccessoryInformation();
    this.informationService.setCharacteristic(hap.Characteristic.Manufacturer, 'Ja');
    this.informationService.setCharacteristic(hap.Characteristic.Model, this.name);
    this.informationService.setCharacteristic(hap.Characteristic.SerialNumber, 'L153K-2');

    this.fanService = new hap.Service.Fanv2();
    this.fanService.getCharacteristic(hap.Characteristic.Active)
      .on(CharacteristicEventTypes.GET, this.handleActiveGet.bind(this))
      .on(CharacteristicEventTypes.SET, this.handleActiveSet.bind(this));

    this.fanService.getCharacteristic(hap.Characteristic.RotationSpeed)
      .on(CharacteristicEventTypes.GET, this.handleRotationSpeedGet.bind(this))
      .on(CharacteristicEventTypes.SET, this.handleRotationSpeedSet.bind(this));
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.fanService,
    ];
  }

  private handleActiveGet(callback: CharacteristicGetCallback) {
    this.log.debug(`Getting ${this.name} Active: ${this.fanController.isOn}`);
    callback(null, this.fanController.isOn);
  }

  private async handleActiveSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.fanController.isOn = value as boolean;
    this.log.debug(`Setting ${this.name} Active: ${this.fanController.isOn}`);

    try {
      await this.fanController.updateFan();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  private handleRotationSpeedGet(callback: CharacteristicGetCallback) {
    this.log.debug(`Getting ${this.name} Speed: ${this.fanController.speed}`);
    callback(null, this.fanController.speed);
  }

  private async handleRotationSpeedSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.fanController.speed = value as number;
    this.log.debug(`Setting ${this.name} Speed: ${this.fanController.speed}`);

    try {
      await this.fanController.updateFan();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
}