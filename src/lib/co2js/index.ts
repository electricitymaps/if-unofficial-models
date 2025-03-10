import {co2} from '@tgwf/co2';
import {ModelPluginInterface} from '../../interfaces';
import {KeyValuePair, ModelParams} from '../../types';

export class Co2jsModel implements ModelPluginInterface {
  staticParams: KeyValuePair = {};
  model: any | undefined;

  async execute(observations: ModelParams[]): Promise<ModelParams[]> {
    return observations.map((observation: any) => {
      this.configure(observation);
      if (observation['bytes'] === undefined) {
        throw new Error('bytes not provided');
      }
      const greenhosting =
        observation['green-web-host'] !== undefined &&
        observation['green-web-host'] === true;
      const options =
        observation['options'] !== undefined
          ? observation['options']
          : undefined;
      let result;
      switch (this.staticParams.type) {
        case 'swd': {
          if (options) {
            result = this.model.perVisitTrace(
              observation['bytes'],
              greenhosting,
              options
            ).co2;
          } else {
            result = this.model.perVisit(observation['bytes'], greenhosting);
          }
          break;
        }
        case '1byte': {
          result = this.model.perByte(observation['bytes'], greenhosting);
          break;
        }
      }
      if (result !== undefined) {
        observation['operational-carbon'] = result;
      }
      return observation;
    });
  }

  async configure(staticParams: object): Promise<ModelPluginInterface> {
    if (staticParams !== undefined && 'type' in staticParams) {
      if (!['1byte', 'swd'].includes(staticParams.type as string)) {
        throw new Error(
          `Invalid co2js model: ${staticParams.type}. Must be one of 1byte or swd.`
        );
      }
      this.staticParams['type'] = staticParams.type;
      this.model = new co2({model: staticParams.type});
    }
    return this;
  }
}
