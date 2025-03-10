export interface IBoaviztaUsageSCI {
  e: number;
  m: number;
}

export interface ICountryCodes {
  [key: string]: string;
}

export type BoaviztaInstanceTypes = {
  [key: string]: string[];
};

export type BoaviztaUsageType = {
  hours_use_time: number;
  time_workload: number;
  years_life_time: number;
  usage_location?: string;
};

export type BoaviztaCpuOutputType = {
  'energy-cpu': number;
  'embodied-carbon': number;
};

export type BoaviztaCloudInstanceType = {
  energy: number;
  'embodied-carbon': number;
};
