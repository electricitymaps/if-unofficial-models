# Boavizta

> [!NOTE]
> Boavizta is a community model, not part of the IF standard library. This means the IF core team are not closely monitoring these models to keep them up to date. You should do your own research before implementing them!

[Boavizta](https://boavizta.org/) is an environmental impact calculator that exposes an API we use in IEF to retrieve energy and embodied carbon estimates.

## Implementation

Boavizta exposes a [REST API](https://doc.api.boavizta.org/). If the `boavizta` model is included in an IEF pipeline, IEF sends API requests to Boavizta. The request payload is generated from input data provided to IEF in an `impl` file.

## Parameters

### Model config

- `allocation`: manufacturing impacts can be reported with two allocation strategies: `TOTAL` is the total impact without adjusting for usage. `LINEAR` distrbutes the impact linearly over the lifespan of a device. See [Boavizta docs](https://doc.api.boavizta.org/Explanations/manufacture_methodology/#hover-a-specific-duration-allocation-linear) for more info.
- `physical-processor`: the name of the physical processor being used
- `core-units`: number of physical cores on a CPU
- `verbose`: determines how much information the API response contains (optional)
- `expected-lifespan`: the lifespan of the component, in seconds
- `location`: geographic location used to lookup grid carbon intensity, e.g. "USA" (optional - falls back to Boavizta default)

### Observations

- `cpu-util`: percentage CPU utilization for a given observation

## Returns

- `embodied-carbon`: carbon emitted in manufacturing the device, in gCO2eq
- `energy-cpu`: energy used by CPU in kWh

## Usage

To run the `boavista-cpu` model an instance of `BoaviztaCpuImpactModel` must be created and its `configure()` method called. Then, the model's `execute()` method can be called, passing `duration`,`cpu-util`,`timestamp` arguments.

This is how you could run the model in Typescript:

```typescript
import {BoaviztaCpuImpactModel} from '@grnsft/if-unofficial-models';

async function runBoavizta() {
  const newModel = await new BoaviztaCpuImpactModel().configure({
    'physical-processor': 'Intel Xeon Gold 6138f',
    'core-units': 24,
    'expected-lifespan': 4 * 365 * 24 * 60 * 60,
  });
  const usage = await newModel.calculate([
    {
      timestamp: '2021-01-01T00:00:00Z',
      duration: 1,
      'cpu-util': 34,
    },
    {
      timestamp: '2021-01-01T00:00:15Z',
      duration: 1,
      'cpu-util': 12,
    },
    {
      timestamp: '2021-01-01T00:00:30Z',
      duration: 1,
      'cpu-util': 1,
    },
    {
      timestamp: '2021-01-01T00:00:45Z',
      duration: 1,
      'cpu-util': 78,
    },
  ]);

  console.log(usage);
}

runBoavizta();
```

## Example `impl`

In IEF models are expected to be invoked from an `impl` file. This is a yaml containing the model configuration and inputs. The following `impl` initializes and runs the `boavizta-cpu` model:

```yaml
name: boavizta-demo
description: calls boavizta api
tags:
initialize:
  models:
    - name: boavizta-cpu
      model: BoaviztaCpuOutputModel
      path: '@grnsft/if-unofficial-models'
      config:
        allocation: LINEAR
        verbose: true
graph:
  children:
    child:
      pipeline:
        - boavizta-cpu
      config:
        boavizta-cpu:
          core-units: 24
          physical-processor: Intel® Core™ i7-1185G7
      inputs:
        - timestamp: 2023-07-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
          duration: 3600 # Secs
          cpu-util: 18.392
        - timestamp: 2023-08-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
          duration: 3600 # Secs
          cpu-util: 16
```

You can run this by passing it to `impact-engine`. Run impact using the following command run from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-unofficial-models
impact-engine --impl ./examples/impls/test/boavizta.yml --ompl ./examples/ompls/boavizta.yml
```
