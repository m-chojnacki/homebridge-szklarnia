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
import { LightController } from './light-controller';

export class LightAccessory implements AccessoryPlugin {
  private readonly informationService: Service;
  private readonly lightbulbService: Service;

  constructor(
    hap: HAP,
    private readonly log: Logging,
    private readonly lightController: LightController,
    readonly name: string,
  ) {
    this.informationService = new hap.Service.AccessoryInformation();
    this.informationService.setCharacteristic(hap.Characteristic.Manufacturer, 'Ja');
    this.informationService.setCharacteristic(hap.Characteristic.Model, this.name);
    this.informationService.setCharacteristic(hap.Characteristic.SerialNumber, 'L153K-0');

    this.lightbulbService = new hap.Service.Lightbulb();
    this.lightbulbService.getCharacteristic(hap.Characteristic.On)
      .on(CharacteristicEventTypes.GET, this.handleOnGet.bind(this))
      .on(CharacteristicEventTypes.SET, this.handleOnSet.bind(this));

    this.lightbulbService.getCharacteristic(hap.Characteristic.Hue)
      .on(CharacteristicEventTypes.GET, this.handleHueGet.bind(this))
      .on(CharacteristicEventTypes.SET, this.handleHueSet.bind(this));

    this.lightbulbService.getCharacteristic(hap.Characteristic.Saturation)
      .on(CharacteristicEventTypes.GET, this.handleSaturationGet.bind(this))
      .on(CharacteristicEventTypes.SET, this.handleSaturationSet.bind(this));

    this.lightbulbService.getCharacteristic(hap.Characteristic.Brightness)
      .on(CharacteristicEventTypes.GET, this.handleBrightnessGet.bind(this))
      .on(CharacteristicEventTypes.SET, this.handleBrightnessSet.bind(this));
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.lightbulbService,
    ];
  }

  private handleOnGet(callback: CharacteristicGetCallback) {
    this.log.debug(`Getting ${this.name} On: ${this.lightController.isOn}`);
    callback(null, this.lightController.isOn);
  }

  private async handleOnSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.lightController.isOn = value as boolean;
    this.log.debug(`Setting ${this.name} On: ${this.lightController.isOn}`);

    try {
      await this.lightController.updateLight();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  private handleHueGet(callback: CharacteristicGetCallback) {
    this.log.debug(`Getting ${this.name} Hue: ${this.lightController.hue}`);
    callback(null, this.lightController.hue);
  }

  private async handleHueSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.lightController.hue = value as number;
    this.log.debug(`Setting ${this.name} Hue: ${this.lightController.hue}`);

    try {
      await this.lightController.updateLight();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  private handleSaturationGet(callback: CharacteristicGetCallback) {
    this.log.debug(`Getting ${this.name} Saturation: ${this.lightController.saturation}`);
    callback(null, this.lightController.saturation);
  }

  private async handleSaturationSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.lightController.saturation = value as number;
    this.log.debug(`Setting ${this.name} Saturation: ${this.lightController.saturation}`);

    try {
      await this.lightController.updateLight();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  private handleBrightnessGet(callback: CharacteristicGetCallback) {
    this.log.debug(`Getting ${this.name} Brightness: ${this.lightController.brightness}`);
    callback(null, this.lightController.brightness);
  }

  private async handleBrightnessSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.lightController.brightness = value as number;
    this.log.debug(`Setting ${this.name} Brightness: ${this.lightController.brightness}`);

    try {
      await this.lightController.updateLight();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
}