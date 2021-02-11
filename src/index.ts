import { API } from 'homebridge';
import { SzklarniaPlatform } from './szklarnia-platform';

export = (api: API) => {
  api.registerPlatform('szklarnia', SzklarniaPlatform);
};
