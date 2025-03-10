import axios from 'axios';

import {KeyValuePair} from '../../types/common';

import {ICountryCodes} from './types';

export class BoaviztaAPI {
  private baseUrl = 'https://api.boavizta.org/v1';

  /**
   * Fetches CPU output data from Boavizta API for a specific component type.
   */
  public async fetchCpuOutputData(
    data: KeyValuePair,
    componentType: string,
    verbose: boolean
  ): Promise<object> {
    const response = await axios.post(
      `${this.baseUrl}/component/${componentType}?verbose=${verbose}&duration=${data['usage']['hours_use_time']}`,
      data
    );

    return response.data;
  }

  /**
   * Fetches cloud instance data from Boavizta API.
   */
  public async fetchCloudInstanceData(
    dataCast: KeyValuePair,
    verbose: boolean
  ): Promise<object> {
    const updatedDataCast = this.replaceHyphensWithUnderscores(dataCast);

    const response = await axios.post(
      `${this.baseUrl}/cloud/instance?verbose=${verbose}&duration=${updatedDataCast['usage']['hours_use_time']}`,
      dataCast
    );
    return response.data;
  }

  /**
   * Gets the list of supported cloud instances for a given provider.
   */
  public async getSupportedInstancesList(provider: string) {
    const instances = await axios.get<string[]>(
      `${this.baseUrl}/cloud/instance/all_instances?provider=${provider}`
    );

    return instances.data;
  }

  /**
   * Gets the list of supported cloud providers.
   */
  public async getSupportedProvidersList(): Promise<string[]> {
    const providers = await axios.get<string[]>(
      `${this.baseUrl}/cloud/instance/all_providers`
    );

    return providers.data;
  }

  /**
   * Gets the list of supported locations by the model.
   */
  public async getSupportedLocations(): Promise<string[]> {
    const countries = await axios.get<ICountryCodes>(
      `${this.baseUrl}/utils/country_code`
    );

    return Object.values(countries.data);
  }

  /**
   * Replaces hyphens with underscores in keys of a key-value pair object.
   */
  private replaceHyphensWithUnderscores(data: KeyValuePair): KeyValuePair {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key.replace(/-/g, '_'),
        value,
      ])
    );
  }
}
