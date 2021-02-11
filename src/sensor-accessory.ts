import {
  AccessoryPlugin,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  HAP,
  Logging,
  Service,
} from 'homebridge';
import { AM2301Sensor, AM2301Status } from './am2301-sensor';

export class SensorAccessory implements AccessoryPlugin {
  private readonly informationService: Service;
  private readonly temperatureService: Service;
  private readonly humidityService: Service;

  constructor(
    hap: HAP,
    private readonly log: Logging,
    readonly name: string,
    private readonly am2301Sensor = new AM2301Sensor(),
  ) {
    this.informationService = new hap.Service.AccessoryInformation();
    this.informationService.setCharacteristic(hap.Characteristic.Manufacturer, 'Ja');
    this.informationService.setCharacteristic(hap.Characteristic.Model, this.name);
    this.informationService.setCharacteristic(hap.Characteristic.SerialNumber, 'L153K-1');

    this.temperatureService = new hap.Service.TemperatureSensor();
    this.temperatureService.getCharacteristic(hap.Characteristic.CurrentTemperature)
      .on(CharacteristicEventTypes.GET, this.handleTemperatureGet.bind(this));

    this.humidityService = new hap.Service.HumiditySensor();
    this.humidityService.getCharacteristic(hap.Characteristic.CurrentRelativeHumidity)
      .on(CharacteristicEventTypes.GET, this.handleHumidityGet.bind(this));
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.temperatureService,
      this.humidityService,
    ];
  }

  private async handleTemperatureGet(callback: CharacteristicGetCallback) {
    try {
      const reading = await this.am2301Sensor.read();

      if (reading.status === AM2301Status.Ok) {
        this.log.debug(`Getting ${this.name} Temperature: ${reading.temperature}`);
        callback(null, reading.temperature);
      } else {
        callback(new Error('Failed to communicate with sensor'), null);
      }
    } catch (error) {
      callback(error, null);
    }
  }

  private async handleHumidityGet(callback: CharacteristicGetCallback) {
    try {
      const reading = await this.am2301Sensor.read();

      if (reading.status === AM2301Status.Ok) {
        this.log.debug(`Getting ${this.name} Humidity: ${reading.humidity}`);
        callback(null, reading.humidity);
      } else {
        callback(new Error('Failed to communicate with sensor'), null);
      }
    } catch (error) {
      callback(error, null);
    }
  }
}